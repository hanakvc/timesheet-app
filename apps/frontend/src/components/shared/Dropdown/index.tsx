import { useId } from "react";
import FormField, { describedBy } from "@/components/shared/FormField";
import { ChevronDownIcon } from "@/components/shared/Icons";
import { Span } from "@/components/styled/Span";
import { cx } from "@/utils/classNames";
import styles from "./styles.module.scss";

export interface DropdownOption {
  value: number;
  label: string;
}

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  layout?: "stacked" | "inline";
}

const Dropdown = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  layout = "stacked",
}: DropdownProps) => {
  const id = useId();
  const select = (
    <span
      className={cx(
        styles.control,
        layout === "inline" && styles.controlCompact,
      )}
    >
      <select
        id={id}
        className={cx(styles.select, layout === "inline" && styles.compact)}
        value={value ?? ""}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy(id, { error })}
        onChange={(event) =>
          onChange(
            event.target.value === "" ? null : Number(event.target.value),
          )
        }
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon size={16} className={styles.arrow} />
    </span>
  );

  if (layout === "inline") {
    return (
      <div className={styles.inline}>
        <label htmlFor={id}>
          <Span size="xSmall" textColor="secondary">
            {label}
          </Span>
        </label>
        {select}
      </div>
    );
  }

  return (
    <FormField label={label} inputId={id} error={error}>
      {select}
    </FormField>
  );
};

export default Dropdown;
