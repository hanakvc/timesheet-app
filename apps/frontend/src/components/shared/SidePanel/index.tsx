import { useId, useRef, type ReactNode } from "react";
import Button from "@/components/shared/Button";
import { CloseIcon } from "@/components/shared/Icons";
import { Heading2 } from "@/components/styled/Heading";
import { Paragraph } from "@/components/styled/Paragraph";
import useDialogFocus from "@/hooks/useDialogFocus";
import styles from "./styles.module.scss";

interface SidePanelProps {
  title: string;
  label?: string;
  subtitle?: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

const SidePanel = ({
  title,
  label,
  subtitle,
  onClose,
  footer,
  children,
}: SidePanelProps) => {
  const panelRef = useRef<HTMLElement>(null);
  const titleId = useId();
  useDialogFocus(panelRef, onClose);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={styles.panel}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.titles}>
            {label && (
              <Paragraph size="xxSmall" textColor="muted">
                {label}
              </Paragraph>
            )}
            <Heading2 id={titleId}>{title}</Heading2>
            {subtitle && (
              <Paragraph size="xSmall" textColor="muted">
                {subtitle}
              </Paragraph>
            )}
          </div>
          <Button
            variant="tertiary"
            iconOnly
            aria-label="Close"
            onClick={onClose}
          >
            <CloseIcon size={20} />
          </Button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </aside>
    </div>
  );
};

export default SidePanel;
