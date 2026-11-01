import { CATALOG_STALE_TIME_MS } from "@/constants/global";
import { listClientsQueryKey } from "@/generated/api/@tanstack/react-query.gen";
import type { PageParams } from "@/interfaces/api";
import type { ClientsPage } from "@/models/client";
import { ApiRequestError } from "@/services/apiClient";
import { listClientsPage } from "@/services/catalog";
import {
  keepPreviousData,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";

export function useClients(
  params: PageParams,
): UseQueryResult<ClientsPage, ApiRequestError> {
  return useQuery<ClientsPage, ApiRequestError>({
    queryKey: listClientsQueryKey({ query: params }),
    queryFn: ({ signal }) => listClientsPage(params, signal),
    staleTime: CATALOG_STALE_TIME_MS,
    placeholderData: keepPreviousData,
  });
}
