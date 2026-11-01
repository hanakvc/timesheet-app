import Button from "@/components/shared/Button";
import Dropdown from "@/components/shared/Dropdown";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/shared/Icons";
import { Span } from "@/components/styled/Span";
import { TABLE_PAGE_SIZES } from "@/constants/global";
import styles from "./styles.module.scss";

interface PaginationProps {
  offset: number;
  limit: number;
  itemCount: number;
  hasMore: boolean;
  onOffsetChange: (offset: number) => void;
  onLimitChange: (limit: number) => void;
}

const PAGE_SIZE_OPTIONS = TABLE_PAGE_SIZES.map((size) => ({
  value: size,
  label: String(size),
}));

const Pagination = ({
  offset,
  limit,
  itemCount,
  hasMore,
  onOffsetChange,
  onLimitChange,
}: PaginationProps) => {
  const first = itemCount === 0 ? 0 : offset + 1;
  const last = offset + itemCount;

  return (
    <nav aria-label="Pagination" className={styles.pagination}>
      <Dropdown
        label="Rows per page"
        layout="inline"
        options={PAGE_SIZE_OPTIONS}
        value={limit}
        onChange={(size) => size !== null && onLimitChange(size)}
      />
      <div className={styles.pages}>
        <Span size="xSmall" textColor="secondary">
          Showing {first}–{last}
        </Span>
        <Button
          size="small"
          iconOnly
          aria-label="Previous page"
          disabled={offset === 0}
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
        >
          <ChevronLeftIcon size={16} />
        </Button>
        <Button
          size="small"
          iconOnly
          aria-label="Next page"
          disabled={!hasMore}
          onClick={() => onOffsetChange(offset + limit)}
        >
          <ChevronRightIcon size={16} />
        </Button>
      </div>
    </nav>
  );
};

export default Pagination;
