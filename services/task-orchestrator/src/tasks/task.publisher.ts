import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  Task,
  TaskStatus,
  EXCHANGE,
  DLX,
  DLQ,
  QUEUES,
  BINDINGS,
  PRIORITY_MAP,
  routingKey,
} from '@neuroqueue/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

const QUEUE_OPTIONS = {
  durable: true,
  arguments: {
    'x-max-priority': 10,
    'x-dead-letter-exchange': DLX,
  },
};

@Injectable()
export class TaskPublisher implements OnApplicationBootstrap {
  private readonly logger = new Logger(TaskPublisher.name);

  constructor(
    private readonly amqp: AmqpConnection,
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const channel = this.amqp.channel;

    // Main topic exchange
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

    // Dead-letter exchange + queue
    await channel.assertExchange(DLX, 'fanout', { durable: true });
    await channel.assertQueue(DLQ, { durable: true });
    await channel.bindQueue(DLQ, DLX, '');

    // Provider queues
    const providerQueues: [string, string][] = [
      [QUEUES.OPENAI, BINDINGS.OPENAI],
      [QUEUES.ANTHROPIC, BINDINGS.ANTHROPIC],
      [QUEUES.REPLICATE, BINDINGS.REPLICATE],
    ];

    for (const [queue, binding] of providerQueues) {
      await channel.assertQueue(queue, QUEUE_OPTIONS);
      await channel.bindQueue(queue, EXCHANGE, binding);
    }

    this.logger.log('RabbitMQ topology declared');
  }

  async publish(task: Task): Promise<void> {
    const priority = task.priority;
    const key = routingKey(task.provider, priority);

    await this.amqp.publish(EXCHANGE, key, task, {
      persistent: true,
      priority: PRIORITY_MAP[priority],
    });

    await this.taskRepo.update(task.id, {
      status: TaskStatus.QUEUED,
      queuedAt: new Date(),
    });

    this.logger.log(`Published task ${task.id} → ${key}`);
  }
}
