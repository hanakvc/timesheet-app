import { useId } from "react";
import FormField, { describedBy } from "@/components/shared/FormField";
import styles from "./styles.module.scss";

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  disabled?: boolean;
  error?: string;
  hint?: string;
}

const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 4,
  disabled,
  error,
  hint,
}: TextAreaProps) => {
  const id = useId();

  return (
    <FormField label={label} inputId={id} error={error} hint={hint}>
      <textarea
        id={id}
        className={styles.textarea}
        rows={rows}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy(id, { hint, error })}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormField>
  );
};

export default TextArea;
