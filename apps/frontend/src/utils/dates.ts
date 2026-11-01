const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

export function durationInMinutes(start: string, end: string): number | null {
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs)
    return null;
  return Math.round((endMs - startMs) / 60_000);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function formatEntryPeriod({
  start,
  end,
}: {
  start: string;
  end: string;
}): string {
  const minutes = durationInMinutes(start, end);
  const span = `${formatDateTime(start)} – ${formatTime(end)}`;
  return minutes === null ? span : `${span} (${formatDuration(minutes)})`;
}

const pad = (value: number) => String(value).padStart(2, "0");

export function isoToLocalInput(iso: string): string {
  const date = new Date(iso);
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export function localInputToIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function defaultEntryTimes(now: Date = new Date()): {
  start: string;
  end: string;
} {
  const end = new Date(now);
  end.setSeconds(0, 0);
  end.setMinutes(end.getMinutes() - (end.getMinutes() % 15));
  const start = new Date(end.getTime() - 60 * 60_000);
  return {
    start: isoToLocalInput(start.toISOString()),
    end: isoToLocalInput(end.toISOString()),
  };
}
