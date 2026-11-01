import Dropdown, { type DropdownOption } from "@/components/shared/Dropdown";
import { Paragraph } from "@/components/styled/Paragraph";
import {
  useClientOptions,
  useProjectOptions,
  useTaskOptions,
} from "@/hooks/queries/usePickerOptions";
import type { TaskSelection, TimeEntryFormErrors } from "@/interfaces/forms";
import styles from "./styles.module.scss";

interface TaskPickerProps {
  value: TaskSelection;
  onChange: (value: TaskSelection) => void;
  errors?: Pick<TimeEntryFormErrors, keyof TaskSelection>;
  disabled?: boolean;
}

const toOptions = (
  items: { id: number; name: string }[] = [],
): DropdownOption[] =>
  items.map(({ id, name }) => ({ value: id, label: name }));

const toTaskOptions = (
  items: { id: number; name: string }[] = [],
): DropdownOption[] =>
  items.map(({ id, name }) => ({ value: id, label: `${name} (#${id})` }));

const TaskPicker = ({
  value,
  onChange,
  errors = {},
  disabled = false,
}: TaskPickerProps) => {
  const clients = useClientOptions();
  const projects = useProjectOptions(value.clientId);
  const tasks = useTaskOptions(value.projectId);

  const projectPlaceholder =
    projects.data?.length === 0 ? "None available" : "Select Project";

  const taskPlaceholder =
    tasks.data?.length === 0 ? "None available" : "Select Task";

  return (
    <div className={styles.fieldset}>
      <Dropdown
        label="Client"
        placeholder="Select Client"
        options={toOptions(clients.data)}
        value={value.clientId}
        disabled={disabled}
        error={errors.clientId}
        onChange={(clientId) =>
          onChange({ clientId, projectId: null, taskId: null })
        }
      />
      <Dropdown
        label="Project"
        placeholder={projectPlaceholder}
        options={toOptions(projects.data)}
        value={value.projectId}
        disabled={disabled || value.clientId === null}
        error={errors.projectId}
        onChange={(projectId) =>
          onChange({ clientId: value.clientId, projectId, taskId: null })
        }
      />
      <Dropdown
        label="Task"
        placeholder={taskPlaceholder}
        options={toTaskOptions(tasks.data)}
        value={value.taskId}
        disabled={disabled || value.projectId === null}
        error={errors.taskId}
        onChange={(taskId) =>
          onChange({
            clientId: value.clientId,
            projectId: value.projectId,
            taskId,
          })
        }
      />

      {(clients.isError || projects.isError || tasks.isError) && (
        <Paragraph size="xxSmall" textColor="danger">
          Something went wrong. Close the panel and try again in a moment.
        </Paragraph>
      )}
    </div>
  );
};

export default TaskPicker;
