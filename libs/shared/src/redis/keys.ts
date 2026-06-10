import { createHash } from 'crypto';

export function hashPrompt(provider: string, model: string, prompt: string, parameters: Record<string, unknown>): string {
  const sorted = Object.fromEntries(Object.entries(parameters).sort(([a], [b]) => a.localeCompare(b)));
  const raw = `${provider}:${model}:${prompt}:${JSON.stringify(sorted)}`;
  return createHash('sha256').update(raw).digest('hex');
}

export const RedisKeys = {
  cache: (hash: string) => `cache:${hash}`,
  circuitState: (provider: string) => `circuit:${provider}:state`,
  circuitFailures: (provider: string) => `circuit:${provider}:failures`,
  rateLimitWindow: (userId: string, window: number) => `ratelimit:${userId}:${window}`,
  taskLock: (taskId: string) => `lock:task:${taskId}`,
  apiKey: (key: string) => `apikeys:${key}`,
  workerHeartbeat: (workerId: string) => `worker:${workerId}:heartbeat`,
} as const;
