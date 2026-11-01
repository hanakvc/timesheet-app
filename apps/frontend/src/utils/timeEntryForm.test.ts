import { describe, expect, it } from "vitest";
import type { TimeEntryFormValues } from "@/interfaces/forms";
import type { TaskContext } from "@/models/task";
import type { TimeEntry } from "@/models/timeEntry";
import {
  emptyFormValues,
  formValuesFromEntry,
  isSameFormValues,
  pickFormErrors,
  toTimeEntryInput,
  validateTimeEntryForm,
} from "./timeEntryForm";

const valid: TimeEntryFormValues = {
  clientId: 3,
  projectId: 106,
  taskId: 405,
  start: "2026-10-30T09:00",
  end: "2026-10-30T10:30",
  comment: "  Reviewed export edge cases  ",
};

describe("validateTimeEntryForm", () => {
  it("accepts a complete entry", () => {
    expect(validateTimeEntryForm(valid)).toEqual({});
  });

  it("explains every missing field", () => {
    expect(
      validateTimeEntryForm({
        ...valid,
        clientId: null,
        projectId: null,
        taskId: null,
        start: "",
        end: "",
        comment: "   ",
      }),
    ).toEqual({
      clientId: "Client selection is required.",
      projectId: "Project selection is required.",
      taskId: "Task selection is required.",
      start: "Start date and time are required.",
      end: "End date and time are required.",
      comment: "Comment is required.",
    });
  });

  it("requires end to be after start", () => {
    expect(
      validateTimeEntryForm({ ...valid, end: "2026-10-30T09:00" }),
    ).toEqual({
      end: "End must be after start.",
    });
  });

  it("accepts client, project and task 0, valid ids", () => {
    expect(
      validateTimeEntryForm({ ...valid, clientId: 0, projectId: 0, taskId: 0 }),
    ).toEqual({});
  });
});

describe("toTimeEntryInput", () => {
  it("trims the comment and sends UTC times", () => {
    expect(toTimeEntryInput(valid)).toEqual({
      taskId: 405,
      comment: "Reviewed export edge cases",
      start: "2026-10-30T08:00:00.000Z",
      end: "2026-10-30T09:30:00.000Z",
    });
  });
});

describe("isSameFormValues", () => {
  it("is true for identical values", () => {
    expect(isSameFormValues(valid, { ...valid })).toBe(true);
  });

  it("notices a change in any field", () => {
    expect(isSameFormValues(valid, { ...valid, comment: "Changed" })).toBe(
      false,
    );
    expect(isSameFormValues(valid, { ...valid, end: "2026-10-30T11:00" })).toBe(
      false,
    );
    expect(isSameFormValues(valid, { ...valid, clientId: 4 })).toBe(false);
  });
});

describe("pickFormErrors", () => {
  it("keeps only the API field messages that belong to the form", () => {
    expect(
      pickFormErrors({
        taskId: "This task no longer exists.",
        limit: "Too big",
      }),
    ).toEqual({
      taskId: "This task no longer exists.",
    });
  });
});

describe("emptyFormValues", () => {
  it("starts empty, or on the given task", () => {
    expect(emptyFormValues()).toMatchObject({
      clientId: null,
      projectId: null,
      taskId: null,
    });
    expect(
      emptyFormValues({ clientId: 3, projectId: 106, taskId: 405 }),
    ).toMatchObject({
      clientId: 3,
      projectId: 106,
      taskId: 405,
      comment: "",
    });
  });
});

describe("formValuesFromEntry", () => {
  const entry: TimeEntry = {
    id: 0,
    taskId: 405,
    comment: "Reviewed export edge cases",
    start: "2026-10-30T08:00:00.000Z",
    end: "2026-10-30T09:30:00.000Z",
    createdAt: "2026-10-30T09:31:00.000Z",
    updatedAt: "2026-10-30T09:31:00.000Z",
  };
  const stamps = { createdAt: entry.createdAt, updatedAt: entry.updatedAt };
  const context: TaskContext = {
    task: {
      id: 405,
      projectId: 106,
      name: "Task 2",
      status: "pending",
      ...stamps,
    },
    project: {
      id: 106,
      clientId: 3,
      name: "Project 3",
      status: "pending",
      ...stamps,
    },
    client: {
      id: 3,
      name: "Client 3",
      description: "",
      status: "in-progress",
      ...stamps,
    },
  };

  it("fills the task picker from the task's project and client, in local time", () => {
    expect(formValuesFromEntry(entry, context)).toEqual({
      clientId: 3,
      projectId: 106,
      taskId: 405,
      start: "2026-10-30T09:00",
      end: "2026-10-30T10:30",
      comment: "Reviewed export edge cases",
    });
  });

  it("keeps the task when its project is unknown", () => {
    expect(
      formValuesFromEntry(entry, { ...context, project: null, client: null }),
    ).toMatchObject({
      clientId: null,
      projectId: null,
      taskId: 405,
    });
  });
});
