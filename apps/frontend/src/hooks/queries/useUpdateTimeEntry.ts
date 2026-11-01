import { listTimeEntriesQueryKey } from "@/generated/api/@tanstack/react-query.gen";
import type { TimeEntryUpdate } from "@/interfaces/api";
import type { TimeEntry } from "@/models/timeEntry";
import { ApiRequestError } from "@/services/apiClient";
import { updateTimeEntryById } from "@/services/timeEntries";
import {
  UseMutateAsyncFunction,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";

interface UseUpdateTimeEntryResult extends Omit<
  UseMutationResult<TimeEntry, ApiRequestError, TimeEntryUpdate>,
  "mutateAsync"
> {
  updateTimeEntry: UseMutateAsyncFunction<
    TimeEntry,
    ApiRequestError,
    TimeEntryUpdate
  >;
}

export function useUpdateTimeEntry(): UseUpdateTimeEntryResult {
  const queryClient = useQueryClient();

  const { mutateAsync, ...rest } = useMutation<
    TimeEntry,
    ApiRequestError,
    TimeEntryUpdate
  >({
    mutationFn: updateTimeEntryById,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: listTimeEntriesQueryKey() }),
  });

  return { updateTimeEntry: mutateAsync, ...rest };
}
