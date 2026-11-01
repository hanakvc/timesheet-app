import ConfirmModal from "@/components/shared/ConfirmModal";
import { TrashIcon } from "@/components/shared/Icons";
import { useDeleteTimeEntry } from "@/hooks/queries/useDeleteTimeEntry";
import useSnackbar from "@/hooks/useSnackbar";
import type { TimeEntry } from "@/models/timeEntry";
import { formatEntryPeriod } from "@/utils/dates";
import { getErrorMessage } from "@/utils/errors";

interface DeleteEntryDialogProps {
  entry: TimeEntry;
  onClose: () => void;
  onDeleted: () => void;
}

const DeleteEntryDialog = ({
  entry,
  onClose,
  onDeleted,
}: DeleteEntryDialogProps) => {
  const { deleteTimeEntry, isPending: isDeleting } = useDeleteTimeEntry();
  const showSnackbar = useSnackbar();

  async function confirm() {
    try {
      await deleteTimeEntry(entry.id);
      showSnackbar({ title: `Time entry #${entry.id} deleted` });
      onDeleted();
    } catch (error) {
      showSnackbar({
        tone: "error",
        title: "Couldn't delete the entry",
        details: [getErrorMessage(error)],
      });
      onClose();
    }
  }

  return (
    <ConfirmModal
      title={`Delete time entry #${entry.id}?`}
      description={`${formatEntryPeriod(entry)} on task #${entry.taskId}. This can't be undone.`}
      icon={<TrashIcon size={20} />}
      confirmLabel="Delete entry"
      loadingLabel="Deleting…"
      onConfirm={() => void confirm()}
      onCancel={onClose}
      isConfirming={isDeleting}
    />
  );
};

export default DeleteEntryDialog;
