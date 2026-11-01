import { useState } from "react";
import TimeEntryForm from "@/components/forms/TimeEntryForm";
import Button from "@/components/shared/Button";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { AlertIcon } from "@/components/shared/Icons";
import SidePanel from "@/components/shared/SidePanel";
import StatusMessage from "@/components/shared/StatusMessage";
import { TIME_ENTRY_FORM_ID } from "@/constants/timeEntries";
import { useCreateTimeEntry } from "@/hooks/queries/useCreateTimeEntry";
import { useUpdateTimeEntry } from "@/hooks/queries/useUpdateTimeEntry";
import useSnackbar from "@/hooks/useSnackbar";
import useTimeEntryForm from "@/hooks/useTimeEntryForm";
import type {
  TimeEntryFormValues,
  TimeEntryPanelMode,
} from "@/interfaces/forms";
import type { TimeEntry } from "@/models/timeEntry";
import { ApiRequestError } from "@/services/apiClient";
import { formatEntryPeriod } from "@/utils/dates";
import { pickFormErrors, toTimeEntryInput } from "@/utils/timeEntryForm";

interface TimeEntryFormPanelProps {
  mode: TimeEntryPanelMode;
  getInitialValues: () => TimeEntryFormValues;
  onClose: () => void;
  onSaved?: (entry: TimeEntry, kind: TimeEntryPanelMode["kind"]) => void;
}

const TimeEntryFormPanel = ({
  mode,
  getInitialValues,
  onClose,
  onSaved,
}: TimeEntryFormPanelProps) => {
  const isEdit = mode.kind === "edit";
  const form = useTimeEntryForm(getInitialValues);
  const showSnackbar = useSnackbar();
  const { createTimeEntry, isPending: isCreating } = useCreateTimeEntry();
  const { updateTimeEntry, isPending: isUpdating } = useUpdateTimeEntry();
  const isSaving = isCreating || isUpdating;

  const [formError, setFormError] = useState<string | null>(null);
  const [entryGone, setEntryGone] = useState(false);
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);

  function requestClose() {
    if (isSaving) return;
    if (form.isDirty) setIsConfirmingDiscard(true);
    else onClose();
  }

  async function save() {
    setFormError(null);
    if (!form.validate()) return;

    try {
      const input = toTimeEntryInput(form.values);
      const saved = isEdit
        ? await updateTimeEntry({ id: mode.entry.id, input })
        : await createTimeEntry(input);
      showSnackbar({
        title: `Time entry #${saved.id} ${isEdit ? "updated" : "created"}`,
        details: [
          `Task #${saved.taskId}`,
          formatEntryPeriod(saved),
          `“${saved.comment}”`,
        ],
      });
      onSaved?.(saved, mode.kind);
      onClose();
    } catch (error) {
      if (!(error instanceof ApiRequestError)) {
        setFormError("Something went wrong. Try again.");
        return;
      }
      if (isEdit && error.status === 404) {
        setEntryGone(true);
        return;
      }
      const fieldErrors = pickFormErrors(error.fields);
      form.setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length === 0) setFormError(error.message);
    }
  }

  if (entryGone && isEdit) {
    return (
      <SidePanel
        title="Edit time entry"
        onClose={onClose}
        footer={<Button onClick={onClose}>Back to my time entries</Button>}
      >
        <StatusMessage
          variant="error"
          title="This time entry no longer exists"
          description={`Entry #${mode.entry.id} was deleted or belongs to another user.`}
        />
      </SidePanel>
    );
  }

  return (
    <>
      <SidePanel
        title={isEdit ? "Edit time entry" : "New time entry"}
        label={isEdit ? `Time entry #${mode.entry.id}` : undefined}
        onClose={requestClose}
        footer={
          <>
            <Button onClick={requestClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="submit"
              form={TIME_ENTRY_FORM_ID}
              variant="primary"
              isLoading={isSaving}
              loadingLabel="Saving…"
              disabled={isEdit && !form.isDirty}
              title={
                isEdit && !form.isDirty ? "No changes to save yet" : undefined
              }
            >
              {isEdit ? "Save changes" : "Create entry"}
            </Button>
          </>
        }
      >
        <TimeEntryForm
          form={form}
          disabled={isSaving}
          formError={formError}
          onSubmit={() => void save()}
        />
      </SidePanel>

      {isConfirmingDiscard && (
        <ConfirmModal
          title="Discard your changes?"
          description={
            isEdit
              ? "Your changes to this time entry will be lost."
              : "This time entry hasn't been saved and will be lost."
          }
          icon={<AlertIcon size={20} />}
          confirmLabel="Discard changes"
          cancelLabel="Keep editing"
          onConfirm={onClose}
          onCancel={() => setIsConfirmingDiscard(false)}
        />
      )}
    </>
  );
};

export default TimeEntryFormPanel;
