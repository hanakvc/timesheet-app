import { describe, expect, it } from "vitest";
import {
  defaultEntryTimes,
  durationInMinutes,
  formatDuration,
  formatEntryPeriod,
  isoToLocalInput,
  localInputToIso,
} from "./dates";

describe("local time ↔ UTC", () => {
  it("shows a UTC time in local time for the input", () => {
    expect(isoToLocalInput("2025-11-26T15:38:33.399Z")).toBe(
      "2025-11-26T16:38",
    );
  });

  it("sends a local input value as UTC", () => {
    expect(localInputToIso("2025-11-26T16:38")).toBe(
      "2025-11-26T15:38:00.000Z",
    );
  });

  it("respects summer time", () => {
    expect(localInputToIso("2026-07-01T09:00")).toBe(
      "2026-07-01T07:00:00.000Z",
    );
  });

  it("round-trips without drift", () => {
    expect(isoToLocalInput(localInputToIso("2026-10-30T09:15") as string)).toBe(
      "2026-10-30T09:15",
    );
  });

  it("returns null for an empty or invalid value", () => {
    expect(localInputToIso("")).toBeNull();
    expect(localInputToIso("not a date")).toBeNull();
  });
});

describe("durations", () => {
  it("counts whole minutes between start and end", () => {
    expect(
      durationInMinutes("2026-10-30T09:00:00Z", "2026-10-30T10:30:00Z"),
    ).toBe(90);
  });

  it("has no duration when end isn't after start", () => {
    expect(
      durationInMinutes("2026-10-30T10:00:00Z", "2026-10-30T09:00:00Z"),
    ).toBeNull();
    expect(
      durationInMinutes("2026-10-30T10:00:00Z", "2026-10-30T10:00:00Z"),
    ).toBeNull();
  });

  it("formats minutes for people", () => {
    expect(formatDuration(30)).toBe("30 min");
    expect(formatDuration(120)).toBe("2 h");
    expect(formatDuration(90)).toBe("1 h 30 min");
  });
});

describe("formatEntryPeriod", () => {
  it("describes an entry's span in local time with its duration", () => {
    expect(
      formatEntryPeriod({
        start: "2025-11-26T13:38:00.000Z",
        end: "2025-11-26T14:08:00.000Z",
      }),
    ).toBe("26 Nov 2025, 14:38 – 15:08 (30 min)");
  });
});

describe("default times for a new entry", () => {
  it("covers the last hour, ending at the latest quarter hour", () => {
    expect(defaultEntryTimes(new Date("2026-10-30T09:52:41"))).toEqual({
      start: "2026-10-30T08:45",
      end: "2026-10-30T09:45",
    });
  });
});
