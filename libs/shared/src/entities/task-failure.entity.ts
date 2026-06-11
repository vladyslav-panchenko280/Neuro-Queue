import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { Task } from './task.entity';

@Entity('task_failures')
export class TaskFailure {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @RelationId((failure: TaskFailure) => failure.task)
  taskId: string;

  @Column({ type: 'varchar', nullable: true })
  provider: string | null;

  @Column({ type: 'varchar', name: 'error_code', nullable: true })
  errorCode: string | null;

  @Column({ type: 'varchar', name: 'error_message', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'attempt_number', default: 0 })
  attemptNumber: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
