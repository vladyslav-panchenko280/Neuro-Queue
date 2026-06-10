import { createHash } from 'crypto';

export function hashPrompt(
  provider: string,
  model: string,
  prompt: string,
  parameters: Record<string, unknown> = {},
): string {
  const sorted = Object.fromEntries(Object.entries(parameters).sort(([a], [b]) => a.localeCompare(b)));
  const raw = `${provider}:${model}:${prompt}:${JSON.stringify(sorted)}`;
  return createHash('sha256').update(raw).digest('hex');
}

export const cacheKey = (hash: string) => `cache:${hash}`;
export const circuitKey = (provider: string) => `circuit:${provider}`;

export const RedisKeys = {
  cache: cacheKey,
  circuitState: (provider: string) => `${circuitKey(provider)}:state`,
  circuitFailures: (provider: string) => `${circuitKey(provider)}:failures`,
  rateLimitWindow: (userId: string, window: number) => `ratelimit:${userId}:${window}`,
  taskLock: (taskId: string) => `lock:task:${taskId}`,
  apiKey: (key: string) => `apikeys:${key}`,
  workerHeartbeat: (workerId: string) => `worker:${workerId}:heartbeat`,
} as const;
