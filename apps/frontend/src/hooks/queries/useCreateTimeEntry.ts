import { listTimeEntriesQueryKey } from "@/generated/api/@tanstack/react-query.gen";
import type { TimeEntryInput } from "@/interfaces/api";
import type { TimeEntry } from "@/models/timeEntry";
import { ApiRequestError } from "@/services/apiClient";
import { createNewTimeEntry } from "@/services/timeEntries";
import {
  UseMutateAsyncFunction,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";

interface UseCreateTimeEntryResult extends Omit<
  UseMutationResult<TimeEntry, ApiRequestError, TimeEntryInput>,
  "mutateAsync"
> {
  createTimeEntry: UseMutateAsyncFunction<
    TimeEntry,
    ApiRequestError,
    TimeEntryInput
  >;
}

export function useCreateTimeEntry(): UseCreateTimeEntryResult {
  const queryClient = useQueryClient();

  const { mutateAsync, ...rest } = useMutation<
    TimeEntry,
    ApiRequestError,
    TimeEntryInput
  >({
    mutationFn: createNewTimeEntry,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: listTimeEntriesQueryKey() }),
  });

  return { createTimeEntry: mutateAsync, ...rest };
}
