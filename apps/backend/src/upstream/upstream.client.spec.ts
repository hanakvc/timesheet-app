import { ApiKeyAuthProvider } from './auth.provider.js';
import type { AuthProvider } from './auth.provider.js';
import { RateLimiter } from './rate-limiter.js';
import { UpstreamClient } from './upstream.client.js';
import { UpstreamError } from './upstream.errors.js';

const fetchMock = vi.fn<typeof fetch>();

function respond(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): Response {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return new Response(text, { status, headers });
}

function makeClient(auth: AuthProvider = new ApiKeyAuthProvider('test-key')) {
  return new UpstreamClient(
    { baseUrl: 'http://upstream.test/api/v1/', timeoutMs: 1_000 },
    auth,
    new RateLimiter(100, 60_000, 1_000),
  );
}

const entryInput = {
  taskId: 405,
  comment: 'Worked on the export',
  start: '2026-10-30T09:00:00.000Z',
  end: '2026-10-30T10:00:00.000Z',
};

describe('UpstreamClient', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends the bearer key and the paging query', async () => {
    fetchMock.mockResolvedValueOnce(respond(200, []));

    await makeClient().listClients({ limit: 3, offset: 10 });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBeInstanceOf(URL);
    expect((url as URL).href).toBe(
      'http://upstream.test/api/v1/clients?limit=3&offset=10',
    );
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer test-key' });
  });

  it('turns a plain-text 401 into an unauthorized error', async () => {
    fetchMock.mockResolvedValueOnce(respond(401, 'Unauthorized'));

    await expect(makeClient().getTask(1)).rejects.toMatchObject({
      kind: 'unauthorized',
    });
  });

  it("keeps the upstream's message on a 404", async () => {
    fetchMock.mockResolvedValueOnce(
      respond(404, { error: 'Task #9 not found' }),
    );

    await expect(makeClient().getTask(9)).rejects.toMatchObject({
      kind: 'not_found',
      options: { upstreamMessage: 'Task #9 not found' },
    });
  });

  it('retries once after a 429', async () => {
    fetchMock
      .mockResolvedValueOnce(
        respond(429, { error: 'Too many requests' }, { 'retry-after': '0' }),
      )
      .mockResolvedValueOnce(respond(200, []));

    await expect(
      makeClient().listTimeEntries({ limit: 10, offset: 0 }),
    ).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('gives up with rate_limited after a second 429', async () => {
    fetchMock
      .mockResolvedValueOnce(respond(429, '', { 'retry-after': '0' }))
      .mockResolvedValueOnce(respond(429, '', { 'retry-after': '0' }));

    await expect(makeClient().getTask(1)).rejects.toMatchObject({
      kind: 'rate_limited',
    });
  });

  it('reports an unreachable upstream as unavailable', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(makeClient().getTask(1)).rejects.toMatchObject({
      kind: 'unavailable',
    });
  });

  it('never retries a POST that timed out, and says the outcome is unknown', async () => {
    const timeout = Object.assign(new Error('timed out'), {
      name: 'TimeoutError',
    });
    fetchMock.mockRejectedValueOnce(timeout);

    const error = await makeClient()
      .createTimeEntry(entryInput)
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(UpstreamError);
    expect((error as UpstreamError).message).toMatch(
      /may or may not have been saved/,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('lets the auth provider refresh once after a 401', async () => {
    const onUnauthorized = vi.fn(() => Promise.resolve());
    const auth: AuthProvider = {
      getAuthHeader: () => Promise.resolve('Bearer token'),
      onUnauthorized,
    };
    fetchMock
      .mockResolvedValueOnce(respond(401, 'Unauthorized'))
      .mockResolvedValueOnce(respond(200, []));

    await makeClient(auth).listClients({ limit: 10, offset: 0 });

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
