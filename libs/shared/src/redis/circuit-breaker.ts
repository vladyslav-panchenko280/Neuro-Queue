import Redis from 'ioredis';
import { RedisKeys } from './keys';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  constructor(
    private readonly redis: Redis,
    private readonly provider: string,
    private readonly failureThreshold: number,
    private readonly openTimeoutMs: number,
    private readonly successThreshold: number = 1,
  ) {}

  async getState(): Promise<CircuitState> {
    const state = await this.redis.get(RedisKeys.circuitState(this.provider));
    return (state as CircuitState | null) ?? 'CLOSED';
  }

  async isOpen(): Promise<boolean> {
    return (await this.getState()) === 'OPEN';
  }

  async recordSuccess(): Promise<void> {
    const state = await this.getState();
    if (state === 'HALF_OPEN') {
      await this.redis.del(RedisKeys.circuitState(this.provider));
      await this.redis.del(RedisKeys.circuitFailures(this.provider));
    }
  }

  async recordFailure(): Promise<void> {
    const state = await this.getState();
    if (state === 'OPEN') return;

    const failures = await this.redis.incr(
      RedisKeys.circuitFailures(this.provider),
    );
    // Short TTL on the failure counter so it resets after inactivity
    await this.redis.expire(RedisKeys.circuitFailures(this.provider), 60);

    if (failures >= this.failureThreshold) {
      await this.redis.set(RedisKeys.circuitState(this.provider), 'OPEN');
      // Transition to HALF_OPEN after the open timeout
      await this.redis.pexpire(
        RedisKeys.circuitState(this.provider),
        this.openTimeoutMs,
      );
    }
  }

  // Called when the OPEN TTL expires → Redis deletes the key, next call
  // reads CLOSED. We set HALF_OPEN explicitly when a call is attempted
  // while state just expired; this method is a convenience for that path.
  async tryReset(): Promise<CircuitState> {
    const state = await this.getState();
    if (state === 'CLOSED') {
      // Key expired (was OPEN), mark as HALF_OPEN for this probe attempt
      await this.redis.set(
        RedisKeys.circuitState(this.provider),
        'HALF_OPEN',
        'EX',
        30,
      );
      return 'HALF_OPEN';
    }
    return state;
  }
}
