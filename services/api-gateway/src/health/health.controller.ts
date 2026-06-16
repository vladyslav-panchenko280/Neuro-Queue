import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const orchestratorUrl = this.config.getOrThrow<string>('ORCHESTRATOR_URL');
    return this.health.check([
      () => this.http.pingCheck('orchestrator', `${orchestratorUrl}/health`),
    ]);
  }
}
