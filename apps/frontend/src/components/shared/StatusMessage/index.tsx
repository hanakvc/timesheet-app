import type { ReactNode } from "react";
import Button from "@/components/shared/Button";
import { AlertIcon, SpinnerIcon } from "@/components/shared/Icons";
import { Paragraph } from "@/components/styled/Paragraph";
import { Span } from "@/components/styled/Span";
import { cx } from "@/utils/classNames";
import styles from "./styles.module.scss";

interface StatusMessageProps {
  variant: "loading" | "empty" | "error";
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; icon?: ReactNode };
  compact?: boolean;
}

const StatusMessage = ({
  variant,
  title,
  description,
  action,
  compact = false,
}: StatusMessageProps) => {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cx(styles.message, styles[variant], compact && styles.compact)}
    >
      {variant === "loading" && (
        <SpinnerIcon className={styles.spinner} size={compact ? 14 : 20} />
      )}
      {variant === "error" && (
        <AlertIcon className={styles.icon} size={compact ? 16 : 20} />
      )}
      <div className={styles.text}>
        <Span
          size={compact ? "xSmall" : "normal"}
          weight={compact ? "normal" : "bold"}
          textColor={
            variant === "error" ? "danger" : compact ? "muted" : "primary"
          }
        >
          {title}
        </Span>
        {description && (
          <Paragraph size="xSmall" textColor="secondary">
            {description}
          </Paragraph>
        )}
      </div>
      {action && (
        <Button
          size="small"
          variant={variant === "empty" ? "primary" : "secondary"}
          onClick={action.onClick}
        >
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default StatusMessage;
