import { describe, expect, it } from "vitest";
import type { TimeEntriesParams } from "@/interfaces/api";
import { nextSortParams } from "./sorting";

const params: TimeEntriesParams = {
  limit: 10,
  offset: 20,
  sortBy: "start",
  order: "desc",
};

describe("nextSortParams", () => {
  it("flips the order when the same column is clicked again", () => {
    expect(nextSortParams(params, "start")).toMatchObject({
      sortBy: "start",
      order: "asc",
    });
    expect(nextSortParams({ ...params, order: "asc" }, "start")).toMatchObject({
      order: "desc",
    });
  });

  it("starts a new column newest first", () => {
    expect(nextSortParams(params, "createdAt")).toMatchObject({
      sortBy: "createdAt",
      order: "desc",
    });
  });

  it("goes back to the first page and keeps the page size", () => {
    expect(nextSortParams(params, "id")).toMatchObject({
      offset: 0,
      limit: 10,
    });
  });
});
