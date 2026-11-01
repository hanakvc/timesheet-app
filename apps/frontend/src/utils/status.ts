export type StatusTone = "accent" | "warning" | "success" | "neutral";

const KNOWN_STATUSES: Record<string, { label: string; tone: StatusTone }> = {
  "in-progress": { label: "In progress", tone: "accent" },
  pending: { label: "Pending", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
};

export function describeStatus(status: string): {
  label: string;
  tone: StatusTone;
} {
  const known = KNOWN_STATUSES[status];
  if (known) return known;
  const readable = status.replace(/[-_]+/g, " ").trim();
  return {
    label: readable
      ? readable.charAt(0).toUpperCase() + readable.slice(1)
      : "Unknown",
    tone: "neutral",
  };
}
