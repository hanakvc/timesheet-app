import { toTask, toTimeEntry } from './upstream.mapper.js';
import type { RawTask, RawTimeEntry } from './upstream.types.js';

const task: RawTask = {
  id: 405,
  name: 'Task 2 for Project 106',
  status: 'pending',
  createdAt: '2025-11-26T12:20:17.565Z',
  updatedAt: '2025-11-26T14:19:17.565Z',
};

describe('upstream mapper', () => {
  it('reads the project from projectId, as the live API sends it', () => {
    expect(toTask({ ...task, projectId: 106 }).projectId).toBe(106);
  });

  it('falls back to parent, as the docs describe it', () => {
    expect(toTask({ ...task, parent: 106 }).projectId).toBe(106);
  });

  it('uses null when the task names no project', () => {
    expect(toTask(task).projectId).toBeNull();
  });

  it('never passes on userId, which is the raw API key', () => {
    const raw: RawTimeEntry = {
      id: 0,
      taskId: 405,
      userId: 'secret-api-key',
      comment: 'Time entry 1 for Task 405',
      start: '2025-11-26T15:38:33.399Z',
      end: '2025-11-26T16:08:33.399Z',
      createdAt: '2025-11-26T15:53:33.399Z',
      updatedAt: '2025-11-26T16:08:33.399Z',
    };

    const entry = toTimeEntry(raw);

    expect(entry).not.toHaveProperty('userId');
    expect(entry.id).toBe(0);
  });
});
