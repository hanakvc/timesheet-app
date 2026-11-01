import type { TextProps } from "@/interfaces/typography";
import { cx } from "@/utils/classNames";
import styles from "./styles.module.scss";

interface ParagraphProps extends TextProps {
  size?: "xxSmall" | "xSmall" | "small";
}

export function Paragraph({
  children,
  size = "small",
  textColor = "primary",
  className,
  id,
}: ParagraphProps) {
  return (
    <p
      id={id}
      className={cx(
        styles.paragraph,
        styles[`size-${size}`],
        styles[`color-${textColor}`],
        className,
      )}
    >
      {children}
    </p>
  );
}
