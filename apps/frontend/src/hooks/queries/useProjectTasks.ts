import { CATALOG_STALE_TIME_MS, TASKS_PAGE_SIZE } from "@/constants/global";
import { listTasksInfiniteQueryKey } from "@/generated/api/@tanstack/react-query.gen";
import type { TasksPage } from "@/models/task";
import { ApiRequestError } from "@/services/apiClient";
import { listProjectTasksPage } from "@/services/catalog";
import { nextPageOffset } from "@/utils/pagination";
import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";

export function useProjectTasks(
  projectId: number,
  enabled: boolean,
): UseInfiniteQueryResult<InfiniteData<TasksPage>, ApiRequestError> {
  return useInfiniteQuery<
    TasksPage,
    ApiRequestError,
    InfiniteData<TasksPage>,
    QueryKey,
    number
  >({
    queryKey: listTasksInfiniteQueryKey({
      path: { id: projectId },
      query: { limit: TASKS_PAGE_SIZE },
    }),
    queryFn: ({ pageParam, signal }) =>
      listProjectTasksPage(
        projectId,
        { limit: TASKS_PAGE_SIZE, offset: pageParam },
        signal,
      ),
    initialPageParam: 0,
    getNextPageParam: nextPageOffset,
    staleTime: CATALOG_STALE_TIME_MS,
    enabled,
  });
}
