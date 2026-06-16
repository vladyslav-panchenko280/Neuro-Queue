import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { DLQ } from '@neuroqueue/shared';
import { TasksService } from './tasks.service';

@Injectable()
export class DlqConsumer {
  private readonly logger = new Logger(DlqConsumer.name);

  constructor(private readonly tasksService: TasksService) {}

  @RabbitSubscribe({
    queue: DLQ,
    exchange: '',
    routingKey: DLQ,
    queueOptions: { durable: true },
    allowNonJsonMessages: true,
  })
  async handleDead(msg: Record<string, unknown>): Promise<void> {
    const taskId = msg['id'] as string | undefined;
    if (!taskId) {
      this.logger.warn('DLQ message missing task id', msg);
      return;
    }

    this.logger.warn(`Dead-lettering task ${taskId}`);
    await this.tasksService.markDead(taskId, msg);
  }
}
