import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { User, ApiKey, Task, TaskFailure } from '@neuroqueue/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, ApiKey, Task, TaskFailure],
      migrations: [__dirname + '/database/migrations/*.{ts,js}'],
      synchronize: false,
      logging: process.env.NODE_ENV !== 'production',
    }),
    TerminusModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
