import { describeStatus } from "@/utils/status";
import { cx } from "@/utils/classNames";
import styles from "./styles.module.scss";

const StatusBadge = ({ status }: { status: string }) => {
  const { label, tone } = describeStatus(status);
  return (
    <span className={cx(styles.badge, styles[tone])}>
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </span>
  );
};

export default StatusBadge;
