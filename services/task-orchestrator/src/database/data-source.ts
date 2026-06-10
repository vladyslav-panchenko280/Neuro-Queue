import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User, ApiKey, Task, TaskFailure } from '@neuroqueue/shared';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, ApiKey, Task, TaskFailure],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});
