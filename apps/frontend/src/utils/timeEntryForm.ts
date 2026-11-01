import {
  COMMENT_MAX_LENGTH,
  VALIDATION_MESSAGES,
} from "@/constants/validations";
import type { TimeEntryInput } from "@/interfaces/api";
import type {
  TaskSelection,
  TimeEntryFormErrors,
  TimeEntryFormField,
  TimeEntryFormValues,
} from "@/interfaces/forms";
import type { TaskContext } from "@/models/task";
import type { TimeEntry } from "@/models/timeEntry";
import { defaultEntryTimes, isoToLocalInput, localInputToIso } from "./dates";

export function emptyFormValues(task?: TaskSelection): TimeEntryFormValues {
  return {
    clientId: task?.clientId ?? null,
    projectId: task?.projectId ?? null,
    taskId: task?.taskId ?? null,
    comment: "",
    ...defaultEntryTimes(),
  };
}

export function formValuesFromEntry(
  entry: TimeEntry,
  context?: TaskContext,
): TimeEntryFormValues {
  return {
    clientId: context?.client?.id ?? context?.project?.clientId ?? null,
    projectId: context?.project?.id ?? null,
    taskId: entry.taskId,
    start: isoToLocalInput(entry.start),
    end: isoToLocalInput(entry.end),
    comment: entry.comment,
  };
}

export function isSameFormValues(
  a: TimeEntryFormValues,
  b: TimeEntryFormValues,
): boolean {
  return (
    a.clientId === b.clientId &&
    a.projectId === b.projectId &&
    a.taskId === b.taskId &&
    a.start === b.start &&
    a.end === b.end &&
    a.comment === b.comment
  );
}

export function validateTimeEntryForm(
  values: TimeEntryFormValues,
): TimeEntryFormErrors {
  const errors: TimeEntryFormErrors = {};
  const start = localInputToIso(values.start);
  const end = localInputToIso(values.end);
  const comment = values.comment.trim();

  if (values.clientId === null)
    errors.clientId = VALIDATION_MESSAGES.clientRequired;
  if (values.projectId === null)
    errors.projectId = VALIDATION_MESSAGES.projectRequired;
  if (values.taskId === null) errors.taskId = VALIDATION_MESSAGES.taskRequired;
  if (!start) errors.start = VALIDATION_MESSAGES.startRequired;
  if (!end) errors.end = VALIDATION_MESSAGES.endRequired;
  if (start && end && Date.parse(end) <= Date.parse(start)) {
    errors.end = VALIDATION_MESSAGES.endAfterStart;
  }
  if (!comment) errors.comment = VALIDATION_MESSAGES.commentRequired;
  else if (comment.length > COMMENT_MAX_LENGTH)
    errors.comment = VALIDATION_MESSAGES.commentTooLong;

  return errors;
}

export function toTimeEntryInput(values: TimeEntryFormValues): TimeEntryInput {
  return {
    taskId: values.taskId as number,
    comment: values.comment.trim(),
    start: localInputToIso(values.start) as string,
    end: localInputToIso(values.end) as string,
  };
}

const FORM_FIELDS: TimeEntryFormField[] = ["taskId", "start", "end", "comment"];

export function pickFormErrors(
  fields: Record<string, string>,
): TimeEntryFormErrors {
  const errors: TimeEntryFormErrors = {};
  for (const field of FORM_FIELDS) {
    if (fields[field]) errors[field] = fields[field];
  }
  return errors;
}
