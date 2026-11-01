import type { TimeEntriesParams, TimeEntrySortField } from "@/interfaces/api";
import { DEFAULT_TABLE_PAGE_SIZE } from "./global";

export const DEFAULT_TIME_ENTRIES_PARAMS: TimeEntriesParams = {
  limit: DEFAULT_TABLE_PAGE_SIZE,
  offset: 0,
  sortBy: "start",
  order: "desc",
};

export const TIME_ENTRY_SORT_FIELDS: TimeEntrySortField[] = [
  "id",
  "taskId",
  "start",
  "end",
  "createdAt",
];

export const TIME_ENTRY_FORM_ID = "time-entry-form";
