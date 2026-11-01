import { ApiRequestError } from "@/services/apiClient";

export function getErrorMessage(error: unknown): string {
  return error instanceof ApiRequestError
    ? error.message
    : "Something went wrong. Try again.";
}
