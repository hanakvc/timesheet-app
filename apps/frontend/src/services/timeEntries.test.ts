import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ApiRequestError, client } from "./apiClient";
import { deleteTimeEntryIfExists } from "./timeEntries";

function respondWith(status: number, body?: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve(
        new Response(body === undefined ? null : JSON.stringify(body), {
          status,
        }),
      ),
    ),
  );
}

describe("deleteTimeEntryIfExists", () => {
  beforeAll(() => client.setConfig({ baseUrl: "http://localhost" }));
  afterEach(() => vi.unstubAllGlobals());

  it("succeeds when the entry is deleted", async () => {
    respondWith(204);
    await expect(deleteTimeEntryIfExists(4)).resolves.toBeUndefined();
  });

  it("succeeds when the entry was already gone", async () => {
    respondWith(404, {
      error: { code: "NOT_FOUND", message: "Time entry #4 no longer exists" },
    });
    await expect(deleteTimeEntryIfExists(4)).resolves.toBeUndefined();
  });

  it("fails with our error format on other errors", async () => {
    respondWith(503, {
      error: { code: "RATE_LIMITED", message: "Too many requests right now." },
    });
    const error = await deleteTimeEntryIfExists(4).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toMatchObject({ status: 503, code: "RATE_LIMITED" });
  });
});
