import { TaskStatus } from '../enums/task-status.enum';

export class TaskResultDto {
  taskId: string;
  status: TaskStatus;
  result: Record<string, unknown> | null;
  errorMessage: string | null;
}
