import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  Task,
  TaskStatus,
  QUEUES,
  EXCHANGE,
  BINDINGS,
  hashPrompt,
  ResponseCache,
  CircuitBreaker,
  RedisKeys,
} from '@neuroqueue/shared';
import { InjectRedis } from '../redis/redis.decorator';
import Redis from 'ioredis';
import { OpenAiProvider } from '../provider/openai.provider';
import { hostname } from 'os';

const MAX_RETRIES = 3;

@Injectable()
export class TaskConsumer {
  private readonly logger = new Logger(TaskConsumer.name);
  private readonly workerId = hostname();
  private readonly cache: ResponseCache;
  private readonly circuit: CircuitBreaker;

  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRedis() private readonly redis: Redis,
    private readonly provider: OpenAiProvider,
    private readonly config: ConfigService,
  ) {
    const ttl = config.get<number>('CACHE_TTL_SECONDS') ?? 3600;
    const threshold = config.get<number>('CIRCUIT_FAILURE_THRESHOLD') ?? 5;
    const timeout = config.get<number>('CIRCUIT_OPEN_TIMEOUT_MS') ?? 30000;
    const successThreshold = config.get<number>('CIRCUIT_SUCCESS_THRESHOLD') ?? 2;

    this.cache = new ResponseCache(redis, ttl);
    this.circuit = new CircuitBreaker(redis, 'openai', threshold, timeout, successThreshold);
  }

  @RabbitSubscribe({
    exchange: EXCHANGE,
    routingKey: BINDINGS.OPENAI,
    queue: QUEUES.OPENAI,
    queueOptions: {
      durable: true,
      arguments: {
        'x-max-priority': 10,
        'x-dead-letter-exchange': 'ai.tasks.dlx',
      },
    },
    allowNonJsonMessages: true,
  })
  async handleTask(task: Task): Promise<void | Nack> {
    if (!task?.id) {
      this.logger.warn('Received message without task id — discarding');
      return new Nack(false);
    }

    this.logger.log(`Processing task ${task.id}`);

    // E1 — mark PROCESSING
    await this.taskRepo.update(task.id, {
      status: TaskStatus.PROCESSING,
      startedAt: new Date(),
      workerId: this.workerId,
    });

    // E2 — cache lookup
    const hash = hashPrompt(task.provider, task.model, task.prompt, task.parameters);
    const cached = await this.cache.get(hash);
    if (cached) {
      this.logger.log(`Cache hit for task ${task.id}`);
      await this.taskRepo.update(task.id, {
        status: TaskStatus.COMPLETED,
        result: cached as unknown as null,
        completedAt: new Date(),
      });
      return;
    }

    // E3 — circuit breaker check
    if (await this.circuit.isOpen()) {
      this.logger.warn(`Circuit OPEN for openai — failing task ${task.id} fast`);
      return this.handleFailure(task, 'Circuit breaker OPEN', true);
    }

    // E4 — provider call
    try {
      const result = await this.provider.complete(task.model, task.prompt, task.parameters);
      const resultJson: Record<string, unknown> = result as unknown as Record<string, unknown>;

      // E5 success — persist + cache + ack
      await this.taskRepo.update(task.id, {
        status: TaskStatus.COMPLETED,
        result: resultJson as unknown as null,
        completedAt: new Date(),
      });
      await this.cache.set(hash, resultJson);
      await this.circuit.recordSuccess();

      this.logger.log(`Task ${task.id} completed`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Task ${task.id} provider error: ${message}`);
      await this.circuit.recordFailure();
      return this.handleFailure(task, message, false);
    }
  }

  private async handleFailure(task: Task, errorMessage: string, fastFail: boolean): Promise<Nack> {
    const current = await this.taskRepo.findOne({ where: { id: task.id } });
    const retryCount = (current?.retryCount ?? task.retryCount ?? 0) + 1;

    if (!fastFail && retryCount < MAX_RETRIES) {
      await this.taskRepo.update(task.id, {
        status: TaskStatus.FAILED,
        errorMessage,
        retryCount,
      });
      this.logger.warn(`Task ${task.id} retry ${retryCount}/${MAX_RETRIES}`);
      // nack with requeue → back into queue for retry
      return new Nack(true);
    }

    // Exhausted — nack without requeue → goes to DLQ
    await this.taskRepo.update(task.id, {
      status: TaskStatus.FAILED,
      errorMessage,
      retryCount,
    });
    this.logger.error(`Task ${task.id} exhausted retries — dead-lettering`);
    return new Nack(false);
  }
}
