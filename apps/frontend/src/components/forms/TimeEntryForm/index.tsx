import DateTimeInput from "@/components/shared/DateTimeInput";
import { AlertIcon, ClockIcon } from "@/components/shared/Icons";
import TextArea from "@/components/shared/TextArea";
import { Span } from "@/components/styled/Span";
import { COMMENT_MAX_LENGTH } from "@/constants/validations";
import type { TimeEntryFormState } from "@/interfaces/forms";
import {
  durationInMinutes,
  formatDuration,
  localInputToIso,
} from "@/utils/dates";
import TaskPicker from "./TaskPicker";
import styles from "./styles.module.scss";
import { TIME_ENTRY_FORM_ID } from "@/constants/timeEntries";

interface TimeEntryFormProps {
  form: TimeEntryFormState;
  disabled?: boolean;
  formError?: string | null;
  onSubmit: () => void;
}

const TimeEntryForm = ({
  form,
  disabled = false,
  formError,
  onSubmit,
}: TimeEntryFormProps) => {
  const { values, errors, update } = form;
  const minutes = durationInMinutes(
    localInputToIso(values.start) ?? "",
    localInputToIso(values.end) ?? "",
  );

  return (
    <form
      id={TIME_ENTRY_FORM_ID}
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {formError && (
        <div role="alert" className={styles.formError}>
          <AlertIcon size={18} />
          <Span size="xSmall" textColor="danger">
            {formError}
          </Span>
        </div>
      )}
      <TaskPicker
        value={{
          clientId: values.clientId,
          projectId: values.projectId,
          taskId: values.taskId,
        }}
        onChange={update}
        errors={errors}
        disabled={disabled}
      />
      <div className={styles.times}>
        <div className={styles.timeFields}>
          <DateTimeInput
            label="Start"
            value={values.start}
            error={errors.start}
            disabled={disabled}
            onChange={(start) => update({ start })}
          />
          <DateTimeInput
            label="End"
            value={values.end}
            error={errors.end}
            disabled={disabled}
            onChange={(end) => update({ end })}
          />
        </div>
        <div className={styles.duration}>
          <ClockIcon size={16} />
          <Span size="xSmall" textColor="secondary">
            Duration
          </Span>
          <Span size="xSmall" weight="medium" className={styles.durationValue}>
            {minutes === null ? "—" : formatDuration(minutes)}
          </Span>
        </div>
      </div>
      <TextArea
        label="Comment"
        value={values.comment}
        placeholder="Enter Comment"
        maxLength={COMMENT_MAX_LENGTH}
        hint={`${values.comment.length} / ${COMMENT_MAX_LENGTH}`}
        error={errors.comment}
        disabled={disabled}
        onChange={(comment) => update({ comment })}
      />
    </form>
  );
};

export default TimeEntryForm;
