import { RateLimiter } from './rate-limiter.js';
import { UpstreamError } from './upstream.errors.js';

function setup({ limit = 3, windowMs = 60_000, maxWaitMs = 10_000 } = {}) {
  let now = 0;
  const sleeps: number[] = [];
  const limiter = new RateLimiter(
    limit,
    windowMs,
    maxWaitMs,
    () => now,
    (ms) => {
      sleeps.push(ms);
      now += ms;
      return Promise.resolve();
    },
  );
  return { limiter, sleeps, advance: (ms: number) => (now += ms) };
}

describe('RateLimiter', () => {
  it('lets `limit` calls through without waiting', async () => {
    const { limiter, sleeps } = setup({ limit: 3 });

    await limiter.acquire();
    await limiter.acquire();
    await limiter.acquire();

    expect(sleeps).toEqual([]);
  });

  it('waits for the next window when the wait is short enough', async () => {
    const { limiter, sleeps } = setup({ limit: 2, windowMs: 5_000 });

    await limiter.acquire();
    await limiter.acquire();
    await limiter.acquire();

    expect(sleeps).toEqual([5_000]);
  });

  it('fails fast with rate_limited when the wait would be too long', async () => {
    const { limiter } = setup({ limit: 1, windowMs: 60_000, maxWaitMs: 8_000 });
    await limiter.acquire();

    const error = await limiter.acquire().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(UpstreamError);
    expect(error).toMatchObject({
      kind: 'rate_limited',
      options: { retryAfterSeconds: 60 },
    });
  });

  it('keeps serving calls after one failed', async () => {
    const { limiter, advance } = setup({ limit: 1, maxWaitMs: 0 });
    await limiter.acquire();
    await expect(limiter.acquire()).rejects.toThrow(UpstreamError);

    advance(60_000);

    await expect(limiter.acquire()).resolves.toBeUndefined();
  });

  it('lowers its budget from the response headers', async () => {
    const { limiter } = setup({ limit: 3, maxWaitMs: 0 });
    await limiter.acquire();

    limiter.update(0, 60);

    await expect(limiter.acquire()).rejects.toThrow(UpstreamError);
  });

  it('never raises its budget from the response headers', async () => {
    const { limiter } = setup({ limit: 3, maxWaitMs: 0 });
    await limiter.acquire();

    limiter.update(14, 60);
    await limiter.acquire();
    await limiter.acquire();

    await expect(limiter.acquire()).rejects.toThrow(UpstreamError);
  });

  it('treats a 429 as an exhausted budget until retry-after has passed', async () => {
    const { limiter, advance } = setup({ limit: 3, maxWaitMs: 0 });
    await limiter.acquire();

    limiter.exhaust(30);
    await expect(limiter.acquire()).rejects.toThrow(UpstreamError);

    advance(30_000);
    await expect(limiter.acquire()).resolves.toBeUndefined();
  });
});
