import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  CreateTaskDto,
  TaskResponseDto,
  TaskResultDto,
} from '@neuroqueue/shared';
import { TasksService } from './tasks.service';

@Controller('internal/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(
    @Body() dto: CreateTaskDto,
  ): Promise<{ taskId: string; status: string }> {
    return this.tasksService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TaskResponseDto> {
    return this.tasksService.findOne(id);
  }

  @Get(':id/result')
  getResult(@Param('id', ParseUUIDPipe) id: string): Promise<TaskResultDto> {
    return this.tasksService.getResult(id);
  }
}
