import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from './task.entity';

@Entity('task_failures')
export class TaskFailure {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  task: Task;

  @Column({ name: 'task_id' })
  taskId: string;

  @Column({ nullable: true })
  provider: string | null;

  @Column({ name: 'error_code', nullable: true })
  errorCode: string | null;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'attempt_number', default: 0 })
  attemptNumber: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
