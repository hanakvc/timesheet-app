import type { TimeEntriesParams, TimeEntrySortField } from "@/interfaces/api";

export function nextSortParams(
  current: TimeEntriesParams,
  field: TimeEntrySortField,
): TimeEntriesParams {
  const flip = current.sortBy === field && current.order === "desc";
  return { ...current, offset: 0, sortBy: field, order: flip ? "asc" : "desc" };
}
