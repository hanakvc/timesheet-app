import Button from "@/components/shared/Button";
import {
  AlertIcon,
  CheckCircleIcon,
  CloseIcon,
} from "@/components/shared/Icons";
import { Paragraph } from "@/components/styled/Paragraph";
import { Span } from "@/components/styled/Span";
import type { SnackbarMessage } from "@/interfaces/snackbar";
import { cx } from "@/utils/classNames";
import styles from "./styles.module.scss";

interface SnackbarProps {
  message: SnackbarMessage | null;
  onClose: () => void;
}

const Snackbar = ({ message, onClose }: SnackbarProps) => {
  return (
    <div className={styles.region} role="status" aria-live="polite">
      {message && (
        <div className={cx(styles.snackbar, styles[message.tone ?? "success"])}>
          {message.tone === "error" ? (
            <AlertIcon className={styles.icon} size={20} />
          ) : (
            <CheckCircleIcon className={styles.icon} size={20} />
          )}
          <div className={styles.text}>
            <Span weight="bold">{message.title}</Span>
            {message.details?.map((line) => (
              <Paragraph key={line} size="xSmall" textColor="secondary">
                {line}
              </Paragraph>
            ))}
          </div>
          <Button
            variant="tertiary"
            size="small"
            iconOnly
            aria-label="Dismiss"
            onClick={onClose}
          >
            <CloseIcon size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Snackbar;
