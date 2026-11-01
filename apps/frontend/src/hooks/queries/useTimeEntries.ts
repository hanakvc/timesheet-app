import { TIME_ENTRIES_STALE_TIME_MS } from "@/constants/global";
import { listTimeEntriesQueryKey } from "@/generated/api/@tanstack/react-query.gen";
import type { TimeEntriesParams } from "@/interfaces/api";
import type { TimeEntriesPage } from "@/models/timeEntry";
import { ApiRequestError } from "@/services/apiClient";
import { listTimeEntriesPage } from "@/services/timeEntries";
import {
  keepPreviousData,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";

export function useTimeEntries(
  params: TimeEntriesParams,
): UseQueryResult<TimeEntriesPage, ApiRequestError> {
  return useQuery<TimeEntriesPage, ApiRequestError>({
    queryKey: listTimeEntriesQueryKey({ query: params }),
    queryFn: ({ signal }) => listTimeEntriesPage(params, signal),
    staleTime: TIME_ENTRIES_STALE_TIME_MS,
    placeholderData: keepPreviousData,
  });
}
