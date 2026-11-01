import {
  getTaskContext,
  listClients,
  listProjects,
  listTasks,
} from "@/generated/api";
import type { PageParams } from "@/interfaces/api";
import type { ClientsPage } from "@/models/client";
import type { ProjectsPage } from "@/models/project";
import type { TaskContext, TasksPage } from "@/models/task";

export async function listClientsPage(
  query: PageParams,
  signal?: AbortSignal,
): Promise<ClientsPage> {
  const { data } = await listClients({ query, signal, throwOnError: true });
  return data;
}

export async function listClientProjectsPage(
  clientId: number,
  query: PageParams,
  signal?: AbortSignal,
): Promise<ProjectsPage> {
  const { data } = await listProjects({
    path: { id: clientId },
    query,
    signal,
    throwOnError: true,
  });
  return data;
}

export async function listProjectTasksPage(
  projectId: number,
  query: PageParams,
  signal?: AbortSignal,
): Promise<TasksPage> {
  const { data } = await listTasks({
    path: { id: projectId },
    query,
    signal,
    throwOnError: true,
  });
  return data;
}

export async function getTaskContextById(
  taskId: number,
  signal?: AbortSignal,
): Promise<TaskContext> {
  const { data } = await getTaskContext({
    path: { id: taskId },
    signal,
    throwOnError: true,
  });
  return data;
}
