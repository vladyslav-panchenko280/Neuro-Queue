import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  CreateTaskDto,
  TaskResponseDto,
  TaskResultDto,
} from '@neuroqueue/shared';

@Injectable()
export class TasksService {
  private readonly orchestratorUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.orchestratorUrl = this.config.getOrThrow<string>('ORCHESTRATOR_URL');
  }

  async create(
    dto: CreateTaskDto,
  ): Promise<{ taskId: string; status: string }> {
    return this.forward<{ taskId: string; status: string }>(
      'POST',
      `${this.orchestratorUrl}/internal/tasks`,
      dto,
    );
  }

  async findOne(id: string): Promise<TaskResponseDto> {
    return this.forward<TaskResponseDto>(
      'GET',
      `${this.orchestratorUrl}/internal/tasks/${id}`,
    );
  }

  async getResult(id: string): Promise<TaskResultDto> {
    return this.forward<TaskResultDto>(
      'GET',
      `${this.orchestratorUrl}/internal/tasks/${id}/result`,
    );
  }

  private async forward<T>(
    method: 'GET' | 'POST',
    url: string,
    body?: unknown,
  ): Promise<T> {
    try {
      const obs =
        method === 'POST'
          ? this.http.post<T>(url, body)
          : this.http.get<T>(url);
      const { data } = await firstValueFrom(obs);
      return data;
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw err;
    }
  }
}
