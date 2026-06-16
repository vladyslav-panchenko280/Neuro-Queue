import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  Task,
  TaskFailure,
  CreateTaskDto,
  TaskResponseDto,
  TaskResultDto,
  TaskStatus,
} from '@neuroqueue/shared';
import { TaskPublisher } from './task.publisher';

@Injectable()
export class TasksService {
  private readonly systemUserId: string;

  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(TaskFailure)
    private readonly failureRepo: Repository<TaskFailure>,
    private readonly publisher: TaskPublisher,
    private readonly config: ConfigService,
  ) {
    this.systemUserId = this.config.getOrThrow<string>('SYSTEM_USER_ID');
  }

  async create(
    dto: CreateTaskDto,
  ): Promise<{ taskId: string; status: string }> {
    const task = this.taskRepo.create({
      userId: this.systemUserId,
      provider: dto.provider,
      model: dto.model,
      priority: dto.priority,
      prompt: dto.prompt,
      parameters: dto.parameters ?? {},
      status: TaskStatus.PENDING,
    });

    const saved = await this.taskRepo.save(task);
    await this.publisher.publish(saved);

    return { taskId: saved.id, status: saved.status };
  }

  async findOne(id: string): Promise<TaskResponseDto> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);

    return {
      taskId: task.id,
      status: task.status,
      provider: task.provider,
      createdAt: task.createdAt,
    };
  }

  async getResult(id: string): Promise<TaskResultDto> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);

    return {
      taskId: task.id,
      status: task.status,
      result: task.result,
      errorMessage: task.errorMessage,
    };
  }

  async markQueued(id: string): Promise<void> {
    await this.taskRepo.update(id, {
      status: TaskStatus.QUEUED,
      queuedAt: new Date(),
    });
  }

  async markDead(taskId: string, msg: Record<string, unknown>): Promise<void> {
    await this.taskRepo.update(taskId, { status: TaskStatus.DEAD });

    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) return;

    await this.failureRepo.save(
      this.failureRepo.create({
        taskId,
        provider: task.provider,
        errorCode: 'DLQ',
        errorMessage:
          (msg['errorMessage'] as string | undefined) ??
          'Dead-lettered after max retries',
        attemptNumber: task.retryCount,
      }),
    );
  }
}
