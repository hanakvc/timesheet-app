import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Client } from '../models/client.model.js';
import type { Project } from '../models/project.model.js';
import type { Task } from '../models/task.model.js';
import type { TimeEntry } from '../models/time-entry.model.js';
import { AUTH_PROVIDER } from './auth.provider.js';
import type { AuthProvider } from './auth.provider.js';
import { RateLimiter } from './rate-limiter.js';
import { UPSTREAM_CONFIG } from './upstream.constants.js';
import type { UpstreamConfig } from './upstream.constants.js';
import { UpstreamError, fromUpstreamStatus } from './upstream.errors.js';
import { toClient, toProject, toTask, toTimeEntry } from './upstream.mapper.js';
import type {
  RawClient,
  RawProject,
  RawTask,
  RawTimeEntry,
  UpstreamListQuery,
  UpstreamTimeEntryInput,
} from './upstream.types.js';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  query?: UpstreamListQuery;
  body?: UpstreamTimeEntryInput;
}

@Injectable()
export class UpstreamClient {
  private readonly logger = new Logger(UpstreamClient.name);

  constructor(
    @Inject(UPSTREAM_CONFIG) private readonly config: UpstreamConfig,
    @Inject(AUTH_PROVIDER) private readonly auth: AuthProvider,
    private readonly rateLimiter: RateLimiter,
  ) {}

  async listClients(query: UpstreamListQuery): Promise<Client[]> {
    const raw = await this.request<RawClient[]>('GET', '/clients', { query });
    return raw.map(toClient);
  }

  async getClient(id: number): Promise<Client> {
    return toClient(await this.request<RawClient>('GET', `/clients/${id}`));
  }

  async listProjects(
    clientId: number,
    query: UpstreamListQuery,
  ): Promise<Project[]> {
    const raw = await this.request<RawProject[]>(
      'GET',
      `/clients/${clientId}/projects`,
      { query },
    );
    return raw.map(toProject);
  }

  async getProject(id: number): Promise<Project> {
    return toProject(await this.request<RawProject>('GET', `/projects/${id}`));
  }

  async listTasks(
    projectId: number,
    query: UpstreamListQuery,
  ): Promise<Task[]> {
    const raw = await this.request<RawTask[]>(
      'GET',
      `/projects/${projectId}/tasks`,
      { query },
    );
    return raw.map(toTask);
  }

  async getTask(id: number): Promise<Task> {
    return toTask(await this.request<RawTask>('GET', `/tasks/${id}`));
  }

  async listTimeEntries(query: UpstreamListQuery): Promise<TimeEntry[]> {
    const raw = await this.request<RawTimeEntry[]>('GET', '/time-entries', {
      query,
    });
    return raw.map(toTimeEntry);
  }

  async createTimeEntry(input: UpstreamTimeEntryInput): Promise<TimeEntry> {
    return toTimeEntry(
      await this.request<RawTimeEntry>('POST', '/time-entries', {
        body: input,
      }),
    );
  }

  async updateTimeEntry(
    id: number,
    input: UpstreamTimeEntryInput,
  ): Promise<TimeEntry> {
    return toTimeEntry(
      await this.request<RawTimeEntry>('PUT', `/time-entries/${id}`, {
        body: input,
      }),
    );
  }

  async deleteTimeEntry(id: number): Promise<void> {
    await this.request<unknown>('DELETE', `/time-entries/${id}`);
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
    isRetry = false,
  ): Promise<T> {
    await this.rateLimiter.acquire();

    const startedAt = Date.now();
    let response: Response;
    try {
      response = await fetch(this.buildUrl(path, options.query), {
        method,
        headers: {
          Authorization: await this.auth.getAuthHeader(),
          Accept: 'application/json',
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: AbortSignal.timeout(this.config.timeoutMs),
      });
    } catch (error) {
      throw this.networkError(method, error);
    }

    const remaining = numberHeader(response, 'ratelimit-remaining');
    this.rateLimiter.update(
      remaining,
      numberHeader(response, 'ratelimit-reset'),
    );
    this.logger.log(
      `${method} ${path} → ${response.status} (${Date.now() - startedAt} ms, ${remaining ?? '?'} left)`,
    );

    const payload = await readBody(response);
    if (response.ok) {
      return payload as T;
    }

    if (response.status === 429 && !isRetry) {
      this.rateLimiter.exhaust(numberHeader(response, 'retry-after'));
      return this.request<T>(method, path, options, true);
    }
    if (response.status === 429) {
      throw new UpstreamError('rate_limited', 'Too many requests right now', {
        retryAfterSeconds: numberHeader(response, 'retry-after'),
      });
    }

    if (response.status === 401 && !isRetry && this.auth.onUnauthorized) {
      await this.auth.onUnauthorized();
      return this.request<T>(method, path, options, true);
    }

    throw fromUpstreamStatus(response.status, errorMessage(payload));
  }

  private buildUrl(path: string, query?: UpstreamListQuery): URL {
    const url = new URL(`${this.config.baseUrl.replace(/\/+$/, '')}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }
    return url;
  }

  private networkError(method: HttpMethod, error: unknown): UpstreamError {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    if (timedOut && method === 'POST') {
      return new UpstreamError(
        'unavailable',
        "The time-tracking service didn't answer in time. Your entry may or may not have been saved, so check your entries before trying again.",
      );
    }
    return new UpstreamError(
      'unavailable',
      timedOut
        ? "The time-tracking service didn't answer in time"
        : "The time-tracking service couldn't be reached",
    );
  }
}

function numberHeader(response: Response, name: string): number | undefined {
  const value = Number(response.headers.get(name));
  return response.headers.has(name) && Number.isFinite(value)
    ? value
    : undefined;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(payload: unknown): string | undefined {
  if (typeof payload === 'string') return payload;
  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    typeof payload.error === 'string'
  ) {
    return payload.error;
  }
  return undefined;
}
