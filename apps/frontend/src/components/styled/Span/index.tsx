import type { TextProps } from "@/interfaces/typography";
import { cx } from "@/utils/classNames";
import styles from "./styles.module.scss";

interface SpanProps extends TextProps {
  size?: "xxSmall" | "xSmall" | "small" | "normal";
  weight?: "normal" | "medium" | "bold";
}

export function Span({
  children,
  size = "small",
  weight = "normal",
  textColor = "primary",
  className,
  id,
}: SpanProps) {
  return (
    <span
      id={id}
      className={cx(
        styles[`size-${size}`],
        styles[`weight-${weight}`],
        styles[`color-${textColor}`],
        className,
      )}
    >
      {children}
    </span>
  );
}
