import SidePanel from "@/components/shared/SidePanel";
import StatusMessage from "@/components/shared/StatusMessage";
import { useTaskContext } from "@/hooks/queries/useTaskContext";
import type { TimeEntryPanelMode } from "@/interfaces/forms";
import type { TimeEntry } from "@/models/timeEntry";
import { getErrorMessage } from "@/utils/errors";
import { emptyFormValues, formValuesFromEntry } from "@/utils/timeEntryForm";
import TimeEntryFormPanel from "./TimeEntryFormPanel";

interface TimeEntryPanelProps {
  mode: TimeEntryPanelMode;
  onClose: () => void;
  onSaved?: (entry: TimeEntry, kind: TimeEntryPanelMode["kind"]) => void;
}

const TimeEntryPanel = ({ mode, onClose, onSaved }: TimeEntryPanelProps) => {
  const taskContext = useTaskContext(
    mode.kind === "edit" ? mode.entry.taskId : null,
  );

  if (mode.kind === "create") {
    return (
      <TimeEntryFormPanel
        mode={mode}
        getInitialValues={() => emptyFormValues(mode.task)}
        onClose={onClose}
        onSaved={onSaved}
      />
    );
  }

  if (!taskContext.data) {
    return (
      <SidePanel title="Edit time entry" onClose={onClose}>
        {taskContext.isError ? (
          <StatusMessage
            variant="error"
            title="Couldn't load this time entry"
            description={getErrorMessage(taskContext.error)}
            action={{
              label: "Try again",
              onClick: () => void taskContext.refetch(),
            }}
          />
        ) : (
          <StatusMessage variant="loading" title="Loading the time entry…" />
        )}
      </SidePanel>
    );
  }

  const context = taskContext.data;
  return (
    <TimeEntryFormPanel
      mode={mode}
      getInitialValues={() => formValuesFromEntry(mode.entry, context)}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
};

export default TimeEntryPanel;
