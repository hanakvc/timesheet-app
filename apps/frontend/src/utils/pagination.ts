import type { PageInfo } from "@/interfaces/api";

export function nextPageOffset(lastPage: {
  page: PageInfo;
}): number | undefined {
  const { hasMore, offset, limit } = lastPage.page;
  return hasMore ? offset + limit : undefined;
}
