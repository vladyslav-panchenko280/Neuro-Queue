import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { Provider } from '../enums/provider.enum';
import { Priority } from '../enums/priority.enum';

export class CreateTaskDto {
  @IsEnum(Provider)
  provider: Provider;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  model: string;

  @IsEnum(Priority)
  priority: Priority;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32_000)
  prompt: string;

  @IsObject()
  @IsOptional()
  parameters?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  @MaxLength(128)
  idempotencyKey?: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  @MaxLength(2048)
  callbackUrl?: string;
}
