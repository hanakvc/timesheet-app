import { listTimeEntriesQueryKey } from "@/generated/api/@tanstack/react-query.gen";
import { ApiRequestError } from "@/services/apiClient";
import { deleteTimeEntryIfExists } from "@/services/timeEntries";
import {
  UseMutateAsyncFunction,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";

interface UseDeleteTimeEntryResult extends Omit<
  UseMutationResult<void, ApiRequestError, number>,
  "mutateAsync"
> {
  deleteTimeEntry: UseMutateAsyncFunction<void, ApiRequestError, number>;
}

export function useDeleteTimeEntry(): UseDeleteTimeEntryResult {
  const queryClient = useQueryClient();

  const { mutateAsync, ...rest } = useMutation<void, ApiRequestError, number>({
    mutationFn: deleteTimeEntryIfExists,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: listTimeEntriesQueryKey() }),
  });

  return { deleteTimeEntry: mutateAsync, ...rest };
}
