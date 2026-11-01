import type { NavigationItem } from "@/interfaces/navigation";

export const APP_NAME = "Timesheet";

export const ROUTES = {
  clients: "/clients",
  timeEntries: "/time-entries",
} as const;

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "Clients", href: ROUTES.clients, icon: "clients" },
  { label: "My time entries", href: ROUTES.timeEntries, icon: "timeEntries" },
];

export const TABLE_PAGE_SIZES = [10, 25, 50];
export const DEFAULT_TABLE_PAGE_SIZE = 10;

export const PROJECTS_PAGE_SIZE = 3;

export const TASKS_PAGE_SIZE = 3;

export const PICKER_PAGE_SIZE = 100;

export const CATALOG_STALE_TIME_MS = 5 * 60_000;

export const TIME_ENTRIES_STALE_TIME_MS = 30_000;

export const SNACKBAR_DURATION_MS = 6_000;
