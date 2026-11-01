import { describe, expect, it } from "vitest";
import { DEFAULT_TIME_ENTRIES_PARAMS } from "@/constants/timeEntries";
import {
  readPageParams,
  readTimeEntriesParams,
  toQueryString,
} from "./urlParams";

const query = (search: string) => new URLSearchParams(search);

describe("readPageParams", () => {
  it("reads a valid page", () => {
    expect(readPageParams(query("limit=25&offset=50"))).toEqual({
      limit: 25,
      offset: 50,
    });
  });

  it("falls back to the first page of the default size", () => {
    expect(readPageParams(query(""))).toEqual({ limit: 10, offset: 0 });
    expect(readPageParams(query("limit=7&offset=-5"))).toEqual({
      limit: 10,
      offset: 0,
    });
    expect(readPageParams(query("limit=abc&offset=1.5"))).toEqual({
      limit: 10,
      offset: 0,
    });
  });
});

describe("readTimeEntriesParams", () => {
  it("reads a valid sort", () => {
    expect(
      readTimeEntriesParams(query("sortBy=taskId&order=asc")),
    ).toMatchObject({
      sortBy: "taskId",
      order: "asc",
    });
  });

  it("ignores columns that can't be sorted and unknown orders", () => {
    expect(readTimeEntriesParams(query("sortBy=comment&order=up"))).toEqual(
      DEFAULT_TIME_ENTRIES_PARAMS,
    );
  });
});

describe("toQueryString", () => {
  it("writes only what differs from the defaults", () => {
    expect(
      toQueryString(DEFAULT_TIME_ENTRIES_PARAMS, DEFAULT_TIME_ENTRIES_PARAMS),
    ).toBe("");
    expect(
      toQueryString(
        { ...DEFAULT_TIME_ENTRIES_PARAMS, offset: 20, sortBy: "end" },
        DEFAULT_TIME_ENTRIES_PARAMS,
      ),
    ).toBe("offset=20&sortBy=end");
  });
});
