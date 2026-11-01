import { UpstreamError } from './upstream.errors.js';

export class RateLimiter {
  private remaining = 0;
  private windowEndsAt = 0;
  private queue: Promise<void> = Promise.resolve();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maxWaitMs: number,
    private readonly now: () => number = () => Date.now(),
    private readonly sleep: (ms: number) => Promise<void> = (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms)),
  ) {}

  acquire(): Promise<void> {
    const turn = this.queue.then(() => this.take());
    this.queue = turn.catch(() => undefined);
    return turn;
  }

  update(remaining?: number, resetSeconds?: number): void {
    if (remaining !== undefined && remaining < this.remaining) {
      this.remaining = remaining;
    }
    if (resetSeconds !== undefined) {
      this.windowEndsAt = this.now() + resetSeconds * 1000;
    }
  }

  exhaust(retryAfterSeconds?: number): void {
    this.remaining = 0;
    if (retryAfterSeconds !== undefined) {
      this.windowEndsAt = this.now() + retryAfterSeconds * 1000;
    }
  }

  private async take(): Promise<void> {
    this.startNewWindowIfDue();
    if (this.remaining > 0) {
      this.remaining -= 1;
      return;
    }

    const waitMs = this.windowEndsAt - this.now();
    if (waitMs > this.maxWaitMs) {
      const retryAfterSeconds = Math.ceil(waitMs / 1000);
      throw new UpstreamError('rate_limited', 'Too many requests right now', {
        retryAfterSeconds,
      });
    }

    await this.sleep(Math.max(waitMs, 0));
    this.startNewWindowIfDue();
    this.remaining -= 1;
  }

  private startNewWindowIfDue(): void {
    if (this.now() >= this.windowEndsAt) {
      this.remaining = this.limit;
      this.windowEndsAt = this.now() + this.windowMs;
    }
  }
}
