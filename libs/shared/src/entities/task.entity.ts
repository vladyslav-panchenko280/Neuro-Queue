import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { User } from './user.entity';
import { Provider } from '../enums/provider.enum';
import { Priority } from '../enums/priority.enum';
import { TaskStatus } from '../enums/task-status.enum';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((task: Task) => task.user)
  userId: string;

  @Column({ type: 'varchar' })
  provider: Provider;

  @Column()
  model: string;

  @Column({ type: 'varchar' })
  priority: Priority;

  @Column({ type: 'varchar', default: TaskStatus.PENDING })
  status!: TaskStatus;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'jsonb', default: {} })
  parameters: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  result: Record<string, unknown> | null;

  @Column({ type: 'varchar', name: 'error_message', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'retry_count', default: 0 })
  retryCount!: number;

  @Column({ type: 'varchar', name: 'worker_id', nullable: true })
  workerId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamptz', name: 'queued_at', nullable: true })
  queuedAt: Date | null;

  @Column({ type: 'timestamptz', name: 'started_at', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamptz', name: 'completed_at', nullable: true })
  completedAt: Date | null;
}
