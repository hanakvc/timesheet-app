import type { TextProps } from "@/interfaces/typography";
import { cx } from "@/utils/classNames";
import styles from "./styles.module.scss";

function createHeading(Tag: "h1" | "h2") {
  return function Heading({
    children,
    textColor = "primary",
    className,
    id,
  }: TextProps) {
    return (
      <Tag
        id={id}
        className={cx(
          styles.heading,
          styles[Tag],
          styles[`color-${textColor}`],
          className,
        )}
      >
        {children}
      </Tag>
    );
  };
}

export const Heading1 = createHeading("h1");

export const Heading2 = createHeading("h2");
