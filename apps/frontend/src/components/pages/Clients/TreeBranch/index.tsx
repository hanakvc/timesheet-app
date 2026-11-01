import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import Button from "@/components/shared/Button";
import StatusMessage from "@/components/shared/StatusMessage";
import { getErrorMessage } from "@/utils/errors";
import styles from "./styles.module.scss";

interface TreeBranchProps<Item> {
  query: UseInfiniteQueryResult<InfiniteData<{ items: Item[] }>, unknown>;
  renderItem: (item: Item) => ReactNode;
}

const TreeBranch = <Item,>({ query, renderItem }: TreeBranchProps<Item>) => {
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      {query.isPending && (
        <li className={styles.state}>
          <StatusMessage compact variant="loading" title="Loading" />
        </li>
      )}
      {query.isError && (
        <li className={styles.state}>
          <StatusMessage
            compact
            variant="error"
            title="Couldn't load."
            description={getErrorMessage(query.error)}
            action={{ label: "Retry", onClick: () => void query.refetch() }}
          />
        </li>
      )}
      {query.isSuccess && items.length === 0 && (
        <li className={styles.state}>
          <StatusMessage compact variant="empty" title="No data." />
        </li>
      )}
      {items.map(renderItem)}
      {query.hasNextPage && (
        <li className={styles.loadMore}>
          <Button
            size="small"
            variant="tertiary"
            onClick={() => void query.fetchNextPage()}
            isLoading={query.isFetchingNextPage}
            loadingLabel="Loading more"
          >
            Load more
          </Button>
        </li>
      )}
    </>
  );
};

export default TreeBranch;
