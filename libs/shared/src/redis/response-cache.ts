import Redis from 'ioredis';
import { cacheKey } from './keys';

export class ResponseCache {
  constructor(
    private readonly redis: Redis,
    private readonly ttlSeconds: number,
  ) {}

  async get(hash: string): Promise<Record<string, unknown> | null> {
    const raw = await this.redis.get(cacheKey(hash));
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, unknown>;
  }

  async set(hash: string, result: Record<string, unknown>): Promise<void> {
    await this.redis.set(cacheKey(hash), JSON.stringify(result), 'EX', this.ttlSeconds);
  }
}
