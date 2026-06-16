import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface ProviderResult {
  output: string;
  model: string;
  usage?: Record<string, unknown>;
}

@Injectable()
export class OpenAiProvider {
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly mock: boolean;
  private readonly client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.mock = config.get<string>('MOCK_PROVIDER') === 'true';
    this.client = new OpenAI({ apiKey: config.get<string>('OPENAI_API_KEY') ?? 'mock' });
  }

  async complete(
    model: string,
    prompt: string,
    parameters: Record<string, unknown>,
  ): Promise<ProviderResult> {
    if (this.mock) {
      this.logger.debug('MOCK_PROVIDER=true — returning canned response');
      return {
        output: `[MOCK] Response to: ${prompt.slice(0, 60)}`,
        model,
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      };
    }

    const response = await this.client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: (parameters['temperature'] as number | undefined) ?? 0.7,
      max_tokens: (parameters['max_tokens'] as number | undefined) ?? 512,
    });

    const output = response.choices[0]?.message?.content ?? '';
    return {
      output,
      model: response.model,
      usage: response.usage as unknown as Record<string, unknown>,
    };
  }
}
