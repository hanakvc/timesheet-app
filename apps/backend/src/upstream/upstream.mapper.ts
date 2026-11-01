import type { Client } from '../models/client.model.js';
import type { Project } from '../models/project.model.js';
import type { Task } from '../models/task.model.js';
import type { TimeEntry } from '../models/time-entry.model.js';
import type {
  RawClient,
  RawProject,
  RawTask,
  RawTimeEntry,
} from './upstream.types.js';

export function toClient(raw: RawClient): Client {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function toProject(raw: RawProject): Project {
  return {
    id: raw.id,
    clientId: raw.clientId,
    name: raw.name,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function toTask(raw: RawTask): Task {
  return {
    id: raw.id,
    projectId: raw.projectId ?? raw.parent ?? null,
    name: raw.name,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function toTimeEntry(raw: RawTimeEntry): TimeEntry {
  return {
    id: raw.id,
    taskId: raw.taskId,
    comment: raw.comment,
    start: raw.start,
    end: raw.end,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}
