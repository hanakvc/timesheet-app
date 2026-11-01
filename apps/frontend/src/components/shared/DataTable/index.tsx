import type { ReactNode } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@/components/shared/Icons";
import type { SortOrder } from "@/interfaces/api";
import { cx } from "@/utils/classNames";
import styles from "./styles.module.scss";

export interface DataTableColumn<Row> {
  title: string;
  hideTitle?: boolean;
  className?: string;
  align?: "left" | "right";
  sortField?: string;
  truncate?: boolean;
  render: (row: Row) => ReactNode;
}

interface DataTableProps<Row> {
  caption: string;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  getRowKey: (row: Row) => string | number;
  sort?: { field: string; order: SortOrder };
  onSort?: (field: string) => void;
  className?: string;
}

const DataTable = <Row,>({
  caption,
  columns,
  rows,
  getRowKey,
  sort,
  onSort,
  className,
}: DataTableProps<Row>) => {
  return (
    <div className={styles.wrapper}>
      <table className={cx(styles.table, className)}>
        <caption className={styles.caption}>{caption}</caption>
        <thead>
          <tr>
            {columns.map(
              ({
                title,
                hideTitle,
                className: columnClass,
                align,
                sortField,
              }) => {
                const sortOrder =
                  sortField !== undefined && sort?.field === sortField
                    ? sort.order
                    : undefined;
                return (
                  <th
                    key={title}
                    scope="col"
                    className={cx(
                      columnClass,
                      align === "right" && styles.right,
                    )}
                    aria-sort={
                      sortOrder
                        ? sortOrder === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                  >
                    {sortField && onSort ? (
                      <button
                        type="button"
                        className={cx(
                          styles.sortButton,
                          sortOrder && styles.sorted,
                        )}
                        onClick={() => onSort(sortField)}
                      >
                        {title}
                        {sortOrder === "asc" && <ArrowUpIcon size={14} />}
                        {sortOrder === "desc" && <ArrowDownIcon size={14} />}
                      </button>
                    ) : (
                      <span className={cx(hideTitle && styles.hidden)}>
                        {title}
                      </span>
                    )}
                  </th>
                );
              },
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map(
                ({
                  title,
                  className: columnClass,
                  align,
                  truncate,
                  render,
                }) => (
                  <td
                    key={title}
                    className={cx(
                      columnClass,
                      align === "right" && styles.right,
                      truncate && styles.truncate,
                    )}
                  >
                    {render(row)}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
