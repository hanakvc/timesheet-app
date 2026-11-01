import { TtlCache } from './ttl-cache.js';

describe('TtlCache', () => {
  it('shares one load between concurrent requests for the same key', async () => {
    const cache = new TtlCache(1_000);
    const load = vi.fn(() => Promise.resolve('clients'));

    const [a, b] = await Promise.all([
      cache.getOrLoad('clients', load),
      cache.getOrLoad('clients', load),
    ]);

    expect(a).toBe('clients');
    expect(b).toBe('clients');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('loads again once the entry has expired', async () => {
    let now = 0;
    const cache = new TtlCache(1_000, () => now);
    const load = vi.fn(() => Promise.resolve('clients'));

    await cache.getOrLoad('clients', load);
    now = 1_000;
    await cache.getOrLoad('clients', load);

    expect(load).toHaveBeenCalledTimes(2);
  });

  it('does not cache a failed load', async () => {
    const cache = new TtlCache(1_000);
    const load = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce('clients');

    await expect(cache.getOrLoad('clients', load)).rejects.toThrow('down');
    await expect(cache.getOrLoad('clients', load)).resolves.toBe('clients');
  });
});
