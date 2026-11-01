"use client";

import { useState } from "react";
import Pagination from "@/components/shared/Pagination";
import StatusMessage from "@/components/shared/StatusMessage";
import TimeEntryPanel from "@/components/shared/TimeEntryPanel";
import { Heading1 } from "@/components/styled/Heading";
import { DEFAULT_TABLE_PAGE_SIZE } from "@/constants/global";
import { useClients } from "@/hooks/queries/useClients";
import useUrlParams from "@/hooks/useUrlParams";
import type { PageParams } from "@/interfaces/api";
import type { TaskSelection } from "@/interfaces/forms";
import { getErrorMessage } from "@/utils/errors";
import { readPageParams } from "@/utils/urlParams";
import ClientNode from "./ClientNode";
import styles from "./styles.module.scss";

const FIRST_PAGE: PageParams = { limit: DEFAULT_TABLE_PAGE_SIZE, offset: 0 };

const Clients = () => {
  const [pageParams, setPageParams] = useUrlParams(readPageParams, FIRST_PAGE);
  const [logTimeOn, setLogTimeOn] = useState<TaskSelection | null>(null);
  const { data, isPending, isError, error, refetch } = useClients(pageParams);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Heading1>Clients</Heading1>
      </div>
      {isPending && (
        <StatusMessage variant="loading" title="Loading clients…" />
      )}
      {isError && (
        <StatusMessage
          variant="error"
          title="Couldn't load clients"
          description={getErrorMessage(error)}
          action={{ label: "Try again", onClick: () => void refetch() }}
        />
      )}
      {!isError && data && data.items.length === 0 && (
        <StatusMessage variant="empty" title="No data." />
      )}
      {!isError && data && data.items.length > 0 && (
        <>
          <ul className={styles.tree} aria-label="Clients, projects and tasks">
            {data.items.map((client) => (
              <ClientNode
                key={client.id}
                client={client}
                onLogTime={setLogTimeOn}
              />
            ))}
          </ul>
          <Pagination
            offset={pageParams.offset}
            limit={pageParams.limit}
            itemCount={data.items.length}
            hasMore={data.page.hasMore}
            onOffsetChange={(offset) =>
              setPageParams({ ...pageParams, offset })
            }
            onLimitChange={(limit) => setPageParams({ limit, offset: 0 })}
          />
        </>
      )}
      {logTimeOn && (
        <TimeEntryPanel
          mode={{ kind: "create", task: logTimeOn }}
          onClose={() => setLogTimeOn(null)}
        />
      )}
    </div>
  );
};

export default Clients;
