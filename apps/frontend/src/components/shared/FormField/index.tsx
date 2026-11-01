import type { ReactNode } from "react";
import { AlertIcon } from "@/components/shared/Icons";
import { Paragraph } from "@/components/styled/Paragraph";
import { Span } from "@/components/styled/Span";
import styles from "./styles.module.scss";

interface FormFieldProps {
  label: string;
  inputId: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function describedBy(
  inputId: string,
  { hint, error }: { hint?: string; error?: string },
): string | undefined {
  if (error) return `${inputId}-error`;
  if (hint) return `${inputId}-hint`;
  return undefined;
}

const FormField = ({
  label,
  inputId,
  hint,
  error,
  children,
}: FormFieldProps) => {
  return (
    <div className={styles.field}>
      <label htmlFor={inputId}>
        <Span size="xSmall" weight="medium" textColor="secondary">
          {label}
        </Span>
      </label>
      {children}
      {hint && !error && (
        <Paragraph id={`${inputId}-hint`} size="xxSmall" textColor="muted">
          {hint}
        </Paragraph>
      )}
      {error && (
        <p id={`${inputId}-error`} className={styles.error}>
          <AlertIcon size={14} />
          <Span size="xxSmall" textColor="danger">
            {error}
          </Span>
        </p>
      )}
    </div>
  );
};

export default FormField;
