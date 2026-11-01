import { Test, TestingModule } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { APP_OPTIONS, configureApp } from './../src/app.setup.js';

type FakeUpstream = (
  method: string,
  path: string,
  url: URL,
) => { status: number; body?: unknown; headers?: Record<string, string> };

const fetchMock = vi.fn<typeof fetch>();
let upstream: FakeUpstream;

function urlOf(input: Parameters<typeof fetch>[0]): URL {
  return new URL(input instanceof Request ? input.url : input.toString());
}

function calledUrl(n = 0): URL {
  return urlOf(fetchMock.mock.calls[n][0]);
}

const rawEntry = {
  id: 0,
  taskId: 405,
  userId: 'secret-api-key',
  comment: 'Time entry 1 for Task 405',
  start: '2025-11-26T15:38:33.399Z',
  end: '2025-11-26T16:08:33.399Z',
  createdAt: '2025-11-26T15:53:33.399Z',
  updatedAt: '2025-11-26T16:08:33.399Z',
};

const validInput = {
  taskId: 405,
  comment: 'Reviewed export edge cases',
  start: '2026-10-30T09:00:00.000Z',
  end: '2026-10-30T10:30:00.000Z',
};

function client(id: number) {
  return {
    id,
    name: `Client ${id}`,
    description: `This is the description for client ${id}.`,
    status: 'in-progress',
    createdAt: '2025-11-25T14:20:17.564Z',
    updatedAt: '2025-11-26T13:20:17.564Z',
  };
}

describe('API (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    process.env.UPSTREAM_API_BASE_URL = 'http://upstream.test/api/v1';
    process.env.UPSTREAM_API_KEY = 'test-key';

    fetchMock.mockReset();
    fetchMock.mockImplementation((input, init) => {
      const url = urlOf(input);
      const path = url.pathname.replace('/api/v1', '');
      const { status, body, headers } = upstream(
        init?.method ?? 'GET',
        path,
        url,
      );
      const text =
        body === undefined
          ? ''
          : typeof body === 'string'
            ? body
            : JSON.stringify(body);
      return Promise.resolve(new Response(text, { status, headers }));
    });
    vi.stubGlobal('fetch', fetchMock);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>({
      ...APP_OPTIONS,
      logger: false,
    });
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    vi.unstubAllGlobals();
  });

  it('GET /health', () => {
    upstream = () => ({ status: 500 });
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200, { status: 'ok' });
  });

  describe('catalog', () => {
    it('pages clients and reports whether there are more', async () => {
      upstream = (_method, _path, url) => {
        const limit = Number(url.searchParams.get('limit'));
        return {
          status: 200,
          body: [1, 2, 3, 4, 5].slice(0, limit).map(client),
        };
      };

      const response = await request(app.getHttpServer())
        .get('/api/v1/clients?limit=2&offset=0')
        .expect(200);

      expect(calledUrl().searchParams.get('limit')).toBe('100');
      expect(calledUrl().searchParams.get('offset')).toBe('0');
      expect(response.body.items).toHaveLength(2);
      expect(response.body.page).toEqual({
        limit: 2,
        offset: 0,
        hasMore: true,
      });
    });

    it('serves every page size and "Load more" of a list from one upstream request', async () => {
      upstream = (_method, path) =>
        path === '/clients/3/projects'
          ? {
              status: 200,
              body: [106, 107, 108, 109].map((id) => ({
                id,
                clientId: 3,
                name: `Project ${id}`,
                status: 'pending',
                createdAt: '',
                updatedAt: '',
              })),
            }
          : { status: 404, body: { error: 'Not found' } };
      const server = app.getHttpServer();

      const firstThree = await request(server)
        .get('/api/v1/clients/3/projects?limit=3')
        .expect(200);
      const loadMore = await request(server)
        .get('/api/v1/clients/3/projects?limit=3&offset=3')
        .expect(200);
      const picker = await request(server)
        .get('/api/v1/clients/3/projects?limit=100')
        .expect(200);

      expect(firstThree.body.page.hasMore).toBe(true);
      expect(
        loadMore.body.items.map((project: { id: number }) => project.id),
      ).toEqual([109]);
      expect(loadMore.body.page.hasMore).toBe(false);
      expect(picker.body.items).toHaveLength(4);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('rejects a page size over 100 before calling the upstream', async () => {
      upstream = () => ({ status: 200, body: [] });

      const response = await request(app.getHttpServer())
        .get('/api/v1/clients?limit=500')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_FAILED');
      expect(response.body.error.fields).toHaveProperty('limit');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('resolves a task to its project and client', async () => {
      upstream = (_method, path) => {
        if (path === '/tasks/405') {
          return {
            status: 200,
            body: {
              id: 405,
              projectId: 106,
              name: 'Task 2 for Project 106',
              status: 'pending',
              createdAt: '',
              updatedAt: '',
            },
          };
        }
        if (path === '/projects/106') {
          return {
            status: 200,
            body: {
              id: 106,
              clientId: 3,
              name: 'Project 2 for Client 3',
              status: 'pending',
              createdAt: '',
              updatedAt: '',
            },
          };
        }
        if (path === '/clients/3') return { status: 200, body: client(3) };
        return { status: 404, body: { error: 'Not found' } };
      };

      const response = await request(app.getHttpServer())
        .get('/api/v1/tasks/405/context')
        .expect(200);

      expect(response.body.task.projectId).toBe(106);
      expect(response.body.project.name).toBe('Project 2 for Client 3');
      expect(response.body.client.name).toBe('Client 3');
    });
  });

  describe('time entries', () => {
    it('lists entries newest first by default, without userId', async () => {
      upstream = () => ({ status: 200, body: [rawEntry] });

      const response = await request(app.getHttpServer())
        .get('/api/v1/time-entries')
        .expect(200);

      const upstreamUrl = calledUrl();
      expect(upstreamUrl.searchParams.get('sortBy')).toBe('start');
      expect(upstreamUrl.searchParams.get('order')).toBe('desc');
      expect(response.body.items[0].id).toBe(0);
      expect(response.body.items[0]).not.toHaveProperty('userId');
    });

    it('creates an entry and returns it with its new id', async () => {
      upstream = (method) =>
        method === 'POST'
          ? { status: 201, body: { ...rawEntry, ...validInput, id: 12 } }
          : { status: 405 };

      const response = await request(app.getHttpServer())
        .post('/api/v1/time-entries')
        .send(validInput)
        .expect(201);

      expect(response.body.id).toBe(12);
    });

    it('explains each invalid field without calling the upstream', async () => {
      upstream = () => ({ status: 201, body: rawEntry });

      const response = await request(app.getHttpServer())
        .post('/api/v1/time-entries')
        .send({
          ...validInput,
          comment: '   ',
          end: '2026-10-30T08:00:00.000Z',
        })
        .expect(400);

      expect(response.body.error.fields).toEqual({
        comment: 'Comment is required.',
        end: 'End must be after start.',
      });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('answers malformed JSON with INVALID_JSON', async () => {
      upstream = () => ({ status: 201, body: rawEntry });

      const response = await request(app.getHttpServer())
        .post('/api/v1/time-entries')
        .set('Content-Type', 'application/json')
        .send('{"taskId": 405,')
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_JSON');
    });

    it('turns an unknown task on create into a taskId field error', async () => {
      upstream = () => ({
        status: 404,
        body: { error: 'Task #405 not found' },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/time-entries')
        .send(validInput)
        .expect(400);

      expect(response.body.error.fields).toHaveProperty('taskId');
    });

    it('updates an entry, sending every field, and returns it without userId', async () => {
      const changed = { ...validInput, taskId: 406, comment: 'Moved task' };
      upstream = (method, path) =>
        method === 'PUT' && path === '/time-entries/0'
          ? { status: 200, body: { ...rawEntry, ...changed } }
          : { status: 404, body: { error: 'Not found' } };

      const response = await request(app.getHttpServer())
        .put('/api/v1/time-entries/0')
        .send(changed)
        .expect(200);

      expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual(
        changed,
      );
      expect(response.body).toMatchObject({
        id: 0,
        taskId: 406,
        comment: 'Moved task',
      });
      expect(response.body).not.toHaveProperty('userId');
    });

    it('answers 404 when updating an entry that no longer exists', async () => {
      upstream = (method, path) =>
        method === 'GET' && path === '/tasks/405'
          ? {
              status: 200,
              body: {
                id: 405,
                projectId: 106,
                name: 'Task 2',
                status: 'pending',
                createdAt: '',
                updatedAt: '',
              },
            }
          : { status: 404, body: { error: 'Time entry #99 not found' } };

      const response = await request(app.getHttpServer())
        .put('/api/v1/time-entries/99')
        .send(validInput)
        .expect(404);

      expect(response.body.error).toEqual({
        code: 'NOT_FOUND',
        message: 'Time entry #99 no longer exists',
      });
    });

    it('turns a task that no longer exists on update into a taskId field error', async () => {
      upstream = () => ({ status: 404, body: { error: 'Not found' } });

      const response = await request(app.getHttpServer())
        .put('/api/v1/time-entries/99')
        .send(validInput)
        .expect(400);

      expect(response.body.error.fields).toHaveProperty('taskId');
      expect(calledUrl(1).pathname).toBe('/api/v1/tasks/405');
    });

    it('deletes an entry with 204', async () => {
      upstream = () => ({
        status: 200,
        body: { message: 'Time entry deleted successfully' },
      });

      await request(app.getHttpServer())
        .delete('/api/v1/time-entries/0')
        .expect(204);
    });
  });

  describe('upstream failures', () => {
    it('answers 503 with Retry-After when the upstream rate limit is hit', async () => {
      upstream = () => ({
        status: 429,
        body: { error: 'Too many requests' },
        headers: { 'retry-after': '60' },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/time-entries')
        .expect(503);

      expect(response.headers['retry-after']).toBe('60');
      expect(response.body.error.code).toBe('RATE_LIMITED');
    });

    it('answers 502 when the upstream rejects our credentials', async () => {
      upstream = () => ({ status: 401, body: 'Unauthorized' });

      const response = await request(app.getHttpServer())
        .get('/api/v1/clients')
        .expect(502);

      expect(response.body.error.code).toBe('UPSTREAM_AUTH');
    });
  });
});
