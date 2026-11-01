import { DEFAULT_TABLE_PAGE_SIZE, TABLE_PAGE_SIZES } from "@/constants/global";
import {
  DEFAULT_TIME_ENTRIES_PARAMS,
  TIME_ENTRY_SORT_FIELDS,
} from "@/constants/timeEntries";
import type {
  PageParams,
  TimeEntriesParams,
  TimeEntrySortField,
} from "@/interfaces/api";

interface Query {
  get(name: string): string | null;
}

export function readPageParams(query: Query): PageParams {
  const limit = Number(query.get("limit"));
  const offset = Number(query.get("offset"));
  return {
    limit: TABLE_PAGE_SIZES.includes(limit) ? limit : DEFAULT_TABLE_PAGE_SIZE,
    offset: Number.isSafeInteger(offset) && offset >= 0 ? offset : 0,
  };
}

export function readTimeEntriesParams(query: Query): TimeEntriesParams {
  const sortBy = query.get("sortBy");
  const order = query.get("order");
  return {
    ...readPageParams(query),
    sortBy: TIME_ENTRY_SORT_FIELDS.includes(sortBy as TimeEntrySortField)
      ? (sortBy as TimeEntrySortField)
      : DEFAULT_TIME_ENTRIES_PARAMS.sortBy,
    order:
      order === "asc" || order === "desc"
        ? order
        : DEFAULT_TIME_ENTRIES_PARAMS.order,
  };
}

export function toQueryString<T extends object>(
  params: T,
  defaults: T,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== defaults[key as keyof T]) query.set(key, String(value));
  }
  return query.toString();
}
