import { Injectable } from '@nestjs/common';
import { BLOCK_SIZE, fetchPage, pageFromBlocks } from '../common/pagination.js';
import type { Page, PageQuery } from '../common/pagination.js';
import { TtlCache } from '../common/ttl-cache.js';
import type { Client } from '../models/client.model.js';
import type { Project } from '../models/project.model.js';
import type { TaskContext } from '../models/task-context.model.js';
import type { Task } from '../models/task.model.js';
import { UpstreamClient } from '../upstream/upstream.client.js';

@Injectable()
export class CatalogService {
  constructor(
    private readonly upstream: UpstreamClient,
    private readonly cache: TtlCache,
  ) {}

  listClients(query: PageQuery): Promise<Page<Client>> {
    return pageFromBlocks(query, (blockOffset) =>
      this.block('clients', blockOffset, async (q) =>
        this.remember('client', await this.upstream.listClients(q)),
      ),
    );
  }

  listProjects(clientId: number, query: PageQuery): Promise<Page<Project>> {
    return pageFromBlocks(query, (blockOffset) =>
      this.block(`client:${clientId}:projects`, blockOffset, async (q) =>
        this.remember('project', await this.upstream.listProjects(clientId, q)),
      ),
    );
  }

  listTasks(projectId: number, query: PageQuery): Promise<Page<Task>> {
    return pageFromBlocks(query, (blockOffset) =>
      this.block(`project:${projectId}:tasks`, blockOffset, async (q) =>
        this.remember('task', await this.upstream.listTasks(projectId, q)),
      ),
    );
  }

  async getTaskContext(taskId: number): Promise<TaskContext> {
    const task = await this.cache.getOrLoad(`task:${taskId}`, () =>
      this.upstream.getTask(taskId),
    );
    if (task.projectId === null) {
      return { task, project: null, client: null };
    }

    const projectId = task.projectId;
    const project = await this.cache.getOrLoad(`project:${projectId}`, () =>
      this.upstream.getProject(projectId),
    );
    const client = await this.cache.getOrLoad(
      `client:${project.clientId}`,
      () => this.upstream.getClient(project.clientId),
    );
    return { task, project, client };
  }

  private block<T>(
    list: string,
    blockOffset: number,
    load: (query: PageQuery) => Promise<T[]>,
  ): Promise<Page<T>> {
    return this.cache.getOrLoad(`${list}:block:${blockOffset}`, () =>
      fetchPage({ limit: BLOCK_SIZE, offset: blockOffset }, load),
    );
  }

  private remember<T extends { id: number }>(kind: string, items: T[]): T[] {
    for (const item of items) {
      this.cache.set(`${kind}:${item.id}`, item);
    }
    return items;
  }
}
