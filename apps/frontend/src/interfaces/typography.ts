import type { ReactNode } from "react";

export type TextColor =
  "primary" | "secondary" | "muted" | "danger" | "success";

export interface TextProps {
  children: ReactNode;
  textColor?: TextColor;
  className?: string;
  id?: string;
}
