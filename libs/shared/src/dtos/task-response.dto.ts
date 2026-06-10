import { TaskStatus } from '../enums/task-status.enum';
import { Provider } from '../enums/provider.enum';

export class TaskResponseDto {
  taskId: string;
  status: TaskStatus;
  provider: Provider;
  createdAt: Date;
}
