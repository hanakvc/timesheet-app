import type { ApiErrorBody } from "@/generated/api";
import { client } from "@/generated/api/client.gen";

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export function toApiRequestError(
  error: unknown,
  response?: Response,
): ApiRequestError {
  if (error instanceof ApiRequestError) return error;

  if (!response) {
    return new ApiRequestError(
      0,
      "NETWORK_ERROR",
      "Couldn't reach the server. Check your connection and try again.",
    );
  }

  const body = (error ?? {}) as Partial<ApiErrorBody>;
  if (!body.error) {
    return response.status >= 500
      ? new ApiRequestError(
          response.status,
          "SERVER_UNAVAILABLE",
          "The server isn't responding right now. Try again in a moment.",
        )
      : new ApiRequestError(
          response.status,
          "REQUEST_FAILED",
          "Something went wrong. Try again.",
        );
  }

  return new ApiRequestError(
    response.status,
    body.error.code,
    body.error.message,
    body.error.fields,
  );
}

client.interceptors.error.use((error, response) =>
  toApiRequestError(error, response),
);

export { client };
