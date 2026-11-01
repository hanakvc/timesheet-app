"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ApiRequestError } from "@/services/apiClient";

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (
    error instanceof ApiRequestError &&
    (error.status < 500 || error.code === "RATE_LIMITED")
  ) {
    return false;
  }
  return failureCount < 1;
}

const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: shouldRetry, refetchOnWindowFocus: false },
          mutations: { retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ReactQueryProvider;
