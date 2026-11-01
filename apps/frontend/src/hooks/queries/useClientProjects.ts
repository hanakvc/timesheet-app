import { CATALOG_STALE_TIME_MS, PROJECTS_PAGE_SIZE } from "@/constants/global";
import { listProjectsInfiniteQueryKey } from "@/generated/api/@tanstack/react-query.gen";
import type { ProjectsPage } from "@/models/project";
import { ApiRequestError } from "@/services/apiClient";
import { listClientProjectsPage } from "@/services/catalog";
import { nextPageOffset } from "@/utils/pagination";
import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";

export function useClientProjects(
  clientId: number,
  enabled: boolean,
): UseInfiniteQueryResult<InfiniteData<ProjectsPage>, ApiRequestError> {
  return useInfiniteQuery<
    ProjectsPage,
    ApiRequestError,
    InfiniteData<ProjectsPage>,
    QueryKey,
    number
  >({
    queryKey: listProjectsInfiniteQueryKey({
      path: { id: clientId },
      query: { limit: PROJECTS_PAGE_SIZE },
    }),
    queryFn: ({ pageParam, signal }) =>
      listClientProjectsPage(
        clientId,
        { limit: PROJECTS_PAGE_SIZE, offset: pageParam },
        signal,
      ),
    initialPageParam: 0,
    getNextPageParam: nextPageOffset,
    staleTime: CATALOG_STALE_TIME_MS,
    enabled,
  });
}
