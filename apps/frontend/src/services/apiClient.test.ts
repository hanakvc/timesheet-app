import { describe, expect, it } from "vitest";
import { ApiRequestError, toApiRequestError } from "./apiClient";

describe("toApiRequestError", () => {
  it("reads our error format, including field messages", () => {
    const body = {
      error: {
        code: "VALIDATION_FAILED",
        message: "Check the fields.",
        fields: { end: "End must be after start." },
      },
    };
    const response = new Response(null, { status: 400 });

    expect(toApiRequestError(body, response)).toMatchObject({
      status: 400,
      code: "VALIDATION_FAILED",
      message: "Check the fields.",
      fields: { end: "End must be after start." },
    });
  });

  it("treats a missing response as a network error", () => {
    expect(toApiRequestError(new TypeError("Failed to fetch"))).toMatchObject({
      status: 0,
      code: "NETWORK_ERROR",
    });
  });

  it("treats a 5xx without our format as the server being unavailable", () => {
    expect(
      toApiRequestError("Bad Gateway", new Response(null, { status: 502 })),
    ).toMatchObject({
      status: 502,
      code: "SERVER_UNAVAILABLE",
    });
  });

  it("passes an ApiRequestError through unchanged", () => {
    const error = new ApiRequestError(404, "NOT_FOUND", "Gone");
    expect(toApiRequestError(error, new Response(null, { status: 404 }))).toBe(
      error,
    );
  });
});
