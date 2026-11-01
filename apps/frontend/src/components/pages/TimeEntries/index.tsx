"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import DateTimeCell from "@/components/shared/DateTimeCell";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/shared/Icons";
import Pagination from "@/components/shared/Pagination";
import StatusMessage from "@/components/shared/StatusMessage";
import TimeEntryPanel from "@/components/shared/TimeEntryPanel";
import { Heading1 } from "@/components/styled/Heading";
import { Span } from "@/components/styled/Span";
import { useTimeEntries } from "@/hooks/queries/useTimeEntries";
import useTimeEntriesTable from "@/hooks/useTimeEntriesTable";
import type { TimeEntryPanelMode } from "@/interfaces/forms";
import type { TimeEntry } from "@/models/timeEntry";
import { durationInMinutes, formatDuration } from "@/utils/dates";
import { getErrorMessage } from "@/utils/errors";
import DeleteEntryDialog from "./DeleteEntryDialog";
import styles from "./styles.module.scss";

const TimeEntries = () => {
  const table = useTimeEntriesTable();
  const [panel, setPanel] = useState<TimeEntryPanelMode | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);
  const { data, isPending, isError, error, refetch } = useTimeEntries(
    table.params,
  );

  function handleSaved(_entry: TimeEntry, kind: TimeEntryPanelMode["kind"]) {
    if (kind === "create") table.goToFirstPage();
  }

  function handleDeleted() {
    setEntryToDelete(null);
    if (data && data.items.length === 1 && table.params.offset > 0)
      table.goToPreviousPage();
  }

  const columns: DataTableColumn<TimeEntry>[] = [
    {
      title: "ID",
      sortField: "id",
      className: styles.idColumn,
      render: ({ id }) => <Span textColor="muted">{id}</Span>,
    },
    {
      title: "Task ID",
      sortField: "taskId",
      className: styles.taskColumn,
      render: ({ taskId }) => <Span weight="medium">{taskId}</Span>,
    },
    {
      title: "Comment",
      truncate: true,
      render: ({ comment }) => (
        <span title={comment}>
          <Span>{comment}</Span>
        </span>
      ),
    },
    {
      title: "Start",
      sortField: "start",
      className: styles.dateColumn,
      render: ({ start }) => <DateTimeCell iso={start} />,
    },
    {
      title: "End",
      sortField: "end",
      className: styles.dateColumn,
      render: ({ end }) => <DateTimeCell iso={end} />,
    },
    {
      title: "Duration",
      className: styles.durationColumn,
      render: ({ start, end }) => {
        const minutes = durationInMinutes(start, end);
        return <Span>{minutes === null ? "—" : formatDuration(minutes)}</Span>;
      },
    },
    {
      title: "Created at",
      sortField: "createdAt",
      className: styles.dateColumn,
      render: ({ createdAt }) => <DateTimeCell iso={createdAt} />,
    },
    {
      title: "Actions",
      hideTitle: true,
      align: "right",
      className: styles.actionsColumn,
      render: (entry) => (
        <span className={styles.actions}>
          <Button
            variant="tertiary"
            size="small"
            iconOnly
            aria-label={`Edit time entry ${entry.id}`}
            onClick={() => setPanel({ kind: "edit", entry })}
          >
            <PencilIcon />
          </Button>
          <Button
            variant="tertiary"
            size="small"
            iconOnly
            aria-label={`Delete time entry ${entry.id}`}
            className={styles.deleteButton}
            onClick={() => setEntryToDelete(entry)}
          >
            <TrashIcon />
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Heading1>My time entries</Heading1>
        <Button variant="primary" onClick={() => setPanel({ kind: "create" })}>
          <PlusIcon size={16} />
          New time entry
        </Button>
      </div>
      {isPending && (
        <StatusMessage variant="loading" title="Loading your time entries…" />
      )}
      {isError && (
        <StatusMessage
          variant="error"
          title="Couldn't load your time entries"
          description={getErrorMessage(error)}
          action={{ label: "Try again", onClick: () => void refetch() }}
        />
      )}
      {!isError && data && data.items.length === 0 && (
        <StatusMessage variant="empty" title="No data." />
      )}
      {!isError && data && data.items.length > 0 && (
        <>
          <DataTable
            caption="My time entries"
            className={styles.table}
            columns={columns}
            rows={data.items}
            getRowKey={(entry) => `${entry.id}-${entry.createdAt}`}
            sort={{ field: table.params.sortBy, order: table.params.order }}
            onSort={table.sortBy}
          />
          <Pagination
            offset={table.params.offset}
            limit={table.params.limit}
            itemCount={data.items.length}
            hasMore={data.page.hasMore}
            onOffsetChange={table.setOffset}
            onLimitChange={table.setLimit}
          />
        </>
      )}
      {panel && (
        <TimeEntryPanel
          key={panel.kind === "edit" ? `edit-${panel.entry.id}` : "create"}
          mode={panel}
          onClose={() => setPanel(null)}
          onSaved={handleSaved}
        />
      )}
      {entryToDelete && (
        <DeleteEntryDialog
          entry={entryToDelete}
          onClose={() => setEntryToDelete(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
};

export default TimeEntries;
