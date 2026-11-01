import { usePathname, useSearchParams } from "next/navigation";
import { toQueryString } from "@/utils/urlParams";

export default function useUrlParams<T extends object>(
  read: (query: URLSearchParams) => T,
  defaults: T,
): [T, (next: T) => void] {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = read(new URLSearchParams(searchParams.toString()));

  function setParams(next: T) {
    const query = toQueryString(next, defaults);
    window.history.pushState(
      null,
      "",
      query ? `${pathname}?${query}` : pathname,
    );
  }

  return [params, setParams];
}
