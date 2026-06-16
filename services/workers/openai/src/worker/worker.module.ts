import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Task } from '@neuroqueue/shared';
import { TaskConsumer } from './task.consumer';
import { OpenAiProvider } from '../provider/openai.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('RABBITMQ_URL'),
        prefetchCount: config.get<number>('RABBITMQ_PREFETCH_COUNT') ?? 5,
        connectionInitOptions: { wait: true },
      }),
    }),
  ],
  providers: [TaskConsumer, OpenAiProvider],
})
export class WorkerModule {}
