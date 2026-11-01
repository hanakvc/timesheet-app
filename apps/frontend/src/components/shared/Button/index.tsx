import type { ButtonHTMLAttributes, ReactNode } from "react";
import { SpinnerIcon } from "@/components/shared/Icons";
import { cx } from "@/utils/classNames";
import styles from "./styles.module.scss";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  size?: "medium" | "small";
  iconOnly?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}

const Button = ({
  variant = "secondary",
  size = "medium",
  iconOnly = false,
  isLoading = false,
  loadingLabel = "Loading…",
  type = "button",
  disabled,
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        iconOnly && styles.iconOnly,
        isLoading && styles.loading,
        className,
      )}
      {...props}
    >
      <span className={styles.label}>{children}</span>
      {isLoading && (
        <span className={styles.spinner}>
          <SpinnerIcon size={16} />
          <span className={styles.loadingLabel}>{loadingLabel}</span>
        </span>
      )}
    </button>
  );
};

export default Button;
