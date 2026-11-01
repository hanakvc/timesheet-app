import { CATALOG_STALE_TIME_MS, PICKER_PAGE_SIZE } from "@/constants/global";
import {
  listClientsQueryKey,
  listProjectsQueryKey,
  listTasksQueryKey,
} from "@/generated/api/@tanstack/react-query.gen";
import type { Client, ClientsPage } from "@/models/client";
import type { Project, ProjectsPage } from "@/models/project";
import type { Task, TasksPage } from "@/models/task";
import { ApiRequestError } from "@/services/apiClient";
import {
  listClientProjectsPage,
  listClientsPage,
  listProjectTasksPage,
} from "@/services/catalog";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

const firstPage = { limit: PICKER_PAGE_SIZE, offset: 0 };

export function useClientOptions(): UseQueryResult<Client[], ApiRequestError> {
  return useQuery<ClientsPage, ApiRequestError, Client[]>({
    queryKey: listClientsQueryKey({ query: firstPage }),
    queryFn: ({ signal }) => listClientsPage(firstPage, signal),
    select: (page) => page.items,
    staleTime: CATALOG_STALE_TIME_MS,
  });
}

export function useProjectOptions(
  clientId: number | null,
): UseQueryResult<Project[], ApiRequestError> {
  return useQuery<ProjectsPage, ApiRequestError, Project[]>({
    queryKey: listProjectsQueryKey({
      path: { id: clientId ?? -1 },
      query: firstPage,
    }),
    queryFn: ({ signal }) =>
      listClientProjectsPage(clientId ?? -1, firstPage, signal),
    select: (page) => page.items,
    staleTime: CATALOG_STALE_TIME_MS,
    enabled: clientId !== null,
  });
}

export function useTaskOptions(
  projectId: number | null,
): UseQueryResult<Task[], ApiRequestError> {
  return useQuery<TasksPage, ApiRequestError, Task[]>({
    queryKey: listTasksQueryKey({
      path: { id: projectId ?? -1 },
      query: firstPage,
    }),
    queryFn: ({ signal }) =>
      listProjectTasksPage(projectId ?? -1, firstPage, signal),
    select: (page) => page.items,
    staleTime: CATALOG_STALE_TIME_MS,
    enabled: projectId !== null,
  });
}
