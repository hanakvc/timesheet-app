import { CATALOG_STALE_TIME_MS } from "@/constants/global";
import { getTaskContextQueryKey } from "@/generated/api/@tanstack/react-query.gen";
import type { TaskContext } from "@/models/task";
import { ApiRequestError } from "@/services/apiClient";
import { getTaskContextById } from "@/services/catalog";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export function useTaskContext(
  taskId: number | null,
): UseQueryResult<TaskContext, ApiRequestError> {
  return useQuery<TaskContext, ApiRequestError>({
    queryKey: getTaskContextQueryKey({ path: { id: taskId ?? -1 } }),
    queryFn: ({ signal }) => getTaskContextById(taskId ?? -1, signal),
    staleTime: CATALOG_STALE_TIME_MS,
    enabled: taskId !== null,
  });
}
