import { Injectable } from '@nestjs/common';
import { fetchPage } from '../common/pagination.js';
import type { Page } from '../common/pagination.js';
import { ValidationFailedException } from '../common/validation-failed.exception.js';
import type { TimeEntry } from '../models/time-entry.model.js';
import { UpstreamClient } from '../upstream/upstream.client.js';
import { UpstreamError } from '../upstream/upstream.errors.js';
import type { TimeEntriesQueryDto } from './dto/time-entries-query.dto.js';
import type { TimeEntryInputDto } from './dto/time-entry-input.dto.js';

@Injectable()
export class TimeEntriesService {
  constructor(private readonly upstream: UpstreamClient) {}

  list(query: TimeEntriesQueryDto): Promise<Page<TimeEntry>> {
    return fetchPage(query, (q) =>
      this.upstream.listTimeEntries({
        ...q,
        sortBy: query.sortBy,
        order: query.order,
      }),
    );
  }

  async create(input: TimeEntryInputDto): Promise<TimeEntry> {
    try {
      return await this.upstream.createTimeEntry(input);
    } catch (error) {
      if (isNotFound(error)) throw taskNoLongerExists();
      throw error;
    }
  }

  async update(id: number, input: TimeEntryInputDto): Promise<TimeEntry> {
    try {
      return await this.upstream.updateTimeEntry(id, input);
    } catch (error) {
      if (!isNotFound(error)) throw error;
      if (!(await this.taskExists(input.taskId))) throw taskNoLongerExists();
      throw entryNoLongerExists(id);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.upstream.deleteTimeEntry(id);
    } catch (error) {
      if (isNotFound(error)) throw entryNoLongerExists(id);
      throw error;
    }
  }

  private async taskExists(taskId: number): Promise<boolean> {
    try {
      await this.upstream.getTask(taskId);
      return true;
    } catch (error) {
      if (isNotFound(error)) return false;
      throw error;
    }
  }
}

function isNotFound(error: unknown): boolean {
  return error instanceof UpstreamError && error.kind === 'not_found';
}

function entryNoLongerExists(id: number): UpstreamError {
  return new UpstreamError('not_found', `Time entry #${id} no longer exists`);
}

function taskNoLongerExists(): ValidationFailedException {
  return new ValidationFailedException({
    taskId: 'This task no longer exists. Pick another task.',
  });
}
