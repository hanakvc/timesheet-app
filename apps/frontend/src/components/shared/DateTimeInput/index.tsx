import { useId } from "react";
import FormField, { describedBy } from "@/components/shared/FormField";
import styles from "./styles.module.scss";

interface DateTimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

const DateTimeInput = ({
  label,
  value,
  onChange,
  disabled,
  error,
}: DateTimeInputProps) => {
  const id = useId();

  return (
    <FormField label={label} inputId={id} error={error}>
      <input
        id={id}
        type="datetime-local"
        className={styles.input}
        value={value}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy(id, { error })}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormField>
  );
};

export default DateTimeInput;
