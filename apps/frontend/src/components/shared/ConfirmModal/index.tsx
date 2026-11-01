import { useId, useRef, type ReactNode } from "react";
import Button from "@/components/shared/Button";
import { Heading2 } from "@/components/styled/Heading";
import { Paragraph } from "@/components/styled/Paragraph";
import useDialogFocus from "@/hooks/useDialogFocus";
import styles from "./styles.module.scss";

interface ConfirmModalProps {
  title: string;
  description: string;
  icon: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  loadingLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
}

const ConfirmModal = ({
  title,
  description,
  icon,
  confirmLabel,
  cancelLabel = "Cancel",
  loadingLabel = "Working…",
  onConfirm,
  onCancel,
  isConfirming = false,
}: ConfirmModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useDialogFocus(dialogRef, onCancel);

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        <span className={styles.icon}>{icon}</span>
        <div className={styles.text}>
          <Heading2 id={titleId} className={styles.title}>
            {title}
          </Heading2>
          <Paragraph id={descriptionId} textColor="secondary">
            {description}
          </Paragraph>
        </div>
        <div className={styles.actions}>
          <Button onClick={onCancel} disabled={isConfirming}>
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isConfirming}
            loadingLabel={loadingLabel}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
