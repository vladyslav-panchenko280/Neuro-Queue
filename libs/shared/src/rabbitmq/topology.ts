import { Priority } from '../enums/priority.enum';

export const EXCHANGE = 'ai.tasks';
export const DLX = 'ai.tasks.dlx';
export const DLQ = 'ai.tasks.dead';

export const QUEUES = {
  OPENAI: 'openai.tasks',
  ANTHROPIC: 'anthropic.tasks',
  REPLICATE: 'replicate.tasks',
} as const;

export const BINDINGS = {
  OPENAI: 'openai.*',
  ANTHROPIC: 'anthropic.*',
  REPLICATE: 'replicate.*',
} as const;

export const PRIORITY_MAP: Record<Priority, number> = {
  [Priority.HIGH]: 9,
  [Priority.MEDIUM]: 5,
  [Priority.LOW]: 1,
};

export function routingKey(provider: string, priority: Priority): string {
  return `${provider}.${priority}`;
}
