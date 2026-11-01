import type { TimeEntry } from "@/models/timeEntry";

export interface TimeEntryFormValues {
  clientId: number | null;
  projectId: number | null;
  taskId: number | null;
  start: string;
  end: string;
  comment: string;
}

export type TaskSelection = Pick<
  TimeEntryFormValues,
  "clientId" | "projectId" | "taskId"
>;

export type TimeEntryFormField =
  "clientId" | "projectId" | "taskId" | "start" | "end" | "comment";

export type TimeEntryFormErrors = Partial<Record<TimeEntryFormField, string>>;

export interface TimeEntryFormState {
  values: TimeEntryFormValues;
  errors: TimeEntryFormErrors;
  isDirty: boolean;
  update: (changes: Partial<TimeEntryFormValues>) => void;
  validate: () => boolean;
  setErrors: (errors: TimeEntryFormErrors) => void;
}

export type TimeEntryPanelMode =
  { kind: "create"; task?: TaskSelection } | { kind: "edit"; entry: TimeEntry };
