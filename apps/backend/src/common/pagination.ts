import type { PageInfo } from '../models/page-info.model.js';

export const MAX_PAGE_SIZE = 100;

export const BLOCK_SIZE = MAX_PAGE_SIZE - 1;

export interface PageQuery {
  limit: number;
  offset: number;
}

export interface Page<T> {
  items: T[];
  page: PageInfo;
}

export async function fetchPage<T>(
  { limit, offset }: PageQuery,
  load: (query: PageQuery) => Promise<T[]>,
): Promise<Page<T>> {
  const askFor = Math.min(limit + 1, MAX_PAGE_SIZE);
  const rows = await load({ limit: askFor, offset });
  const fullPageWithoutExtra = askFor === limit && rows.length === limit;
  return {
    items: rows.slice(0, limit),
    page: {
      limit,
      offset,
      hasMore: rows.length > limit || fullPageWithoutExtra,
    },
  };
}

export async function pageFromBlocks<T>(
  { limit, offset }: PageQuery,
  loadBlock: (blockOffset: number) => Promise<Page<T>>,
): Promise<Page<T>> {
  const firstBlock = Math.floor(offset / BLOCK_SIZE) * BLOCK_SIZE;
  const rows: T[] = [];
  let continues = true;
  for (
    let blockOffset = firstBlock;
    blockOffset < offset + limit && continues;
    blockOffset += BLOCK_SIZE
  ) {
    const block = await loadBlock(blockOffset);
    rows.push(...block.items);
    continues = block.page.hasMore;
  }

  const start = offset - firstBlock;
  const end = start + limit;
  return {
    items: rows.slice(start, end),
    page: {
      limit,
      offset,
      hasMore: rows.length > end || (rows.length === end && continues),
    },
  };
}
