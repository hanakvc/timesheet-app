import { Span } from "@/components/styled/Span";
import { formatDate, formatTime } from "@/utils/dates";
import styles from "./styles.module.scss";

const DateTimeCell = ({ iso }: { iso: string }) => {
  return (
    <span className={styles.dateTime}>
      <Span>{formatTime(iso)}</Span>
      <Span size="xxSmall" textColor="muted">
        {formatDate(iso)}
      </Span>
    </span>
  );
};

export default DateTimeCell;
