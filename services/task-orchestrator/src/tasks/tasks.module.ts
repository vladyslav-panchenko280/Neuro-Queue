import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Task, TaskFailure } from '@neuroqueue/shared';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskPublisher } from './task.publisher';
import { DlqConsumer } from './dlq.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskFailure]),
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('RABBITMQ_URL'),
        connectionInitOptions: { wait: true },
      }),
    }),
  ],
  controllers: [TasksController],
  providers: [TasksService, TaskPublisher, DlqConsumer],
})
export class TasksModule {}
