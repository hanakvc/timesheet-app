import { useState } from "react";
import { flushSync } from "react-dom";
import { TIME_ENTRY_FORM_ID } from "@/constants/timeEntries";
import type {
  TimeEntryFormErrors,
  TimeEntryFormField,
  TimeEntryFormState,
  TimeEntryFormValues,
} from "@/interfaces/forms";
import { isSameFormValues, validateTimeEntryForm } from "@/utils/timeEntryForm";

export default function useTimeEntryForm(
  getInitialValues: () => TimeEntryFormValues,
): TimeEntryFormState {
  const [initialValues] = useState(getInitialValues);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<TimeEntryFormErrors>({});

  function update(changes: Partial<TimeEntryFormValues>) {
    setValues((current) => ({ ...current, ...changes }));
    setErrors((current) => {
      const next = { ...current };
      for (const field of Object.keys(changes))
        delete next[field as TimeEntryFormField];
      return next;
    });
  }

  function validate(): boolean {
    const found = validateTimeEntryForm(values);
    flushSync(() => setErrors(found));
    if (Object.keys(found).length === 0) return true;
    document
      .querySelector<HTMLElement>(
        `#${TIME_ENTRY_FORM_ID} [aria-invalid="true"]`,
      )
      ?.focus();
    return false;
  }

  return {
    values,
    errors,
    isDirty: !isSameFormValues(values, initialValues),
    update,
    validate,
    setErrors,
  };
}
