import { DEFAULT_TIME_ENTRIES_PARAMS } from "@/constants/timeEntries";
import type { TimeEntrySortField } from "@/interfaces/api";
import { nextSortParams } from "@/utils/sorting";
import { readTimeEntriesParams } from "@/utils/urlParams";
import useUrlParams from "./useUrlParams";

export default function useTimeEntriesTable() {
  const [params, setParams] = useUrlParams(
    readTimeEntriesParams,
    DEFAULT_TIME_ENTRIES_PARAMS,
  );

  return {
    params,
    sortBy: (field: string) =>
      setParams(nextSortParams(params, field as TimeEntrySortField)),
    setOffset: (offset: number) => setParams({ ...params, offset }),
    setLimit: (limit: number) => setParams({ ...params, limit, offset: 0 }),
    goToFirstPage: () => setParams({ ...params, offset: 0 }),
    goToPreviousPage: () =>
      setParams({
        ...params,
        offset: Math.max(0, params.offset - params.limit),
      }),
  };
}
