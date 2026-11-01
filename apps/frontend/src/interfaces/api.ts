import type { ListTimeEntriesData, TimeEntryInputDto } from "@/generated/api";

export type { PageInfo } from "@/generated/api";

export type TimeEntryInput = TimeEntryInputDto;

export interface TimeEntryUpdate {
  id: number;
  input: TimeEntryInput;
}

export interface PageParams {
  limit: number;
  offset: number;
}

export type TimeEntriesParams = Required<
  NonNullable<ListTimeEntriesData["query"]>
>;

export type TimeEntrySortField = TimeEntriesParams["sortBy"];

export type SortOrder = TimeEntriesParams["order"];
