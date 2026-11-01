import {
  createTimeEntry,
  deleteTimeEntry,
  listTimeEntries,
  updateTimeEntry,
} from "@/generated/api";
import type {
  TimeEntriesParams,
  TimeEntryInput,
  TimeEntryUpdate,
} from "@/interfaces/api";
import type { TimeEntriesPage, TimeEntry } from "@/models/timeEntry";
import { ApiRequestError } from "./apiClient";

export async function listTimeEntriesPage(
  query: TimeEntriesParams,
  signal?: AbortSignal,
): Promise<TimeEntriesPage> {
  const { data } = await listTimeEntries({ query, signal, throwOnError: true });
  return data;
}

export async function createNewTimeEntry(
  input: TimeEntryInput,
): Promise<TimeEntry> {
  const { data } = await createTimeEntry({ body: input, throwOnError: true });
  return data;
}

export async function deleteTimeEntryIfExists(id: number): Promise<void> {
  try {
    await deleteTimeEntry({ path: { id }, throwOnError: true });
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return;
    throw error;
  }
}

export async function updateTimeEntryById({
  id,
  input,
}: TimeEntryUpdate): Promise<TimeEntry> {
  const { data } = await updateTimeEntry({
    path: { id },
    body: input,
    throwOnError: true,
  });
  return data;
}
