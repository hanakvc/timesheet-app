import {
  BLOCK_SIZE,
  MAX_PAGE_SIZE,
  fetchPage,
  pageFromBlocks,
} from './pagination.js';

describe('fetchPage', () => {
  it('asks for one more item than the page size', async () => {
    const load = vi.fn(() => Promise.resolve([1, 2, 3]));

    await fetchPage({ limit: 3, offset: 6 }, load);

    expect(load).toHaveBeenCalledWith({ limit: 4, offset: 6 });
  });

  it('reports a next page when the extra item comes back, and drops it', async () => {
    const page = await fetchPage({ limit: 3, offset: 0 }, () =>
      Promise.resolve([1, 2, 3, 4]),
    );

    expect(page).toEqual({
      items: [1, 2, 3],
      page: { limit: 3, offset: 0, hasMore: true },
    });
  });

  it('reports no next page when exactly the page size comes back', async () => {
    const page = await fetchPage({ limit: 3, offset: 0 }, () =>
      Promise.resolve([1, 2, 3]),
    );

    expect(page.page.hasMore).toBe(false);
  });

  it('never asks the upstream for more than its maximum page size', async () => {
    const load = vi.fn(() =>
      Promise.resolve(Array.from({ length: MAX_PAGE_SIZE }, (_, i) => i)),
    );

    const page = await fetchPage({ limit: MAX_PAGE_SIZE, offset: 0 }, load);

    expect(load).toHaveBeenCalledWith({ limit: MAX_PAGE_SIZE, offset: 0 });
    expect(page.items).toHaveLength(MAX_PAGE_SIZE);
    expect(page.page.hasMore).toBe(true);
  });
});

describe('pageFromBlocks', () => {
  function blocksOf(length: number) {
    const list = Array.from({ length }, (_, index) => index);
    return vi.fn((blockOffset: number) =>
      fetchPage({ limit: BLOCK_SIZE, offset: blockOffset }, (query) =>
        Promise.resolve(list.slice(query.offset, query.offset + query.limit)),
      ),
    );
  }

  it('asks the upstream for at most its maximum page size per block', async () => {
    const load = vi.fn(() => Promise.resolve([]));

    await fetchPage({ limit: BLOCK_SIZE, offset: 0 }, load);

    expect(load).toHaveBeenCalledWith({ limit: MAX_PAGE_SIZE, offset: 0 });
  });

  it('cuts a small page out of the first block', async () => {
    const loadBlock = blocksOf(5);

    const page = await pageFromBlocks({ limit: 3, offset: 3 }, loadBlock);

    expect(page).toEqual({
      items: [3, 4],
      page: { limit: 3, offset: 3, hasMore: false },
    });
    expect(loadBlock).toHaveBeenCalledExactlyOnceWith(0);
  });

  it('knows a list of exactly one block has nothing after its last page', async () => {
    const loadBlock = blocksOf(BLOCK_SIZE);

    const page = await pageFromBlocks(
      { limit: 10, offset: BLOCK_SIZE - 10 },
      loadBlock,
    );

    expect(page.items).toHaveLength(10);
    expect(page.items.at(-1)).toBe(BLOCK_SIZE - 1);
    expect(page.page.hasMore).toBe(false);
    expect(loadBlock).toHaveBeenCalledExactlyOnceWith(0);
  });

  it('loads only the block a page falls in', async () => {
    const loadBlock = blocksOf(1000);
    const offset = 2 * BLOCK_SIZE + 5;

    const page = await pageFromBlocks({ limit: 10, offset }, loadBlock);

    expect(page.items[0]).toBe(offset);
    expect(page.page.hasMore).toBe(true);
    expect(loadBlock).toHaveBeenCalledExactlyOnceWith(2 * BLOCK_SIZE);
  });

  it('joins two blocks when a page crosses from one into the next', async () => {
    const loadBlock = blocksOf(150);

    const page = await pageFromBlocks(
      { limit: 3, offset: BLOCK_SIZE - 1 },
      loadBlock,
    );

    expect(page.items).toEqual([BLOCK_SIZE - 1, BLOCK_SIZE, BLOCK_SIZE + 1]);
    expect(page.page.hasMore).toBe(true);
    expect(loadBlock.mock.calls).toEqual([[0], [BLOCK_SIZE]]);
  });

  it('reports a next page when a full block ends exactly where the page ends', async () => {
    const loadBlock = blocksOf(BLOCK_SIZE + 1);

    const page = await pageFromBlocks(
      { limit: BLOCK_SIZE, offset: 0 },
      loadBlock,
    );

    expect(page.items).toHaveLength(BLOCK_SIZE);
    expect(page.page.hasMore).toBe(true);
  });

  it('serves a full-size page of a 100-item list exactly, with nothing after it', async () => {
    const loadBlock = blocksOf(MAX_PAGE_SIZE);

    const page = await pageFromBlocks(
      { limit: MAX_PAGE_SIZE, offset: 0 },
      loadBlock,
    );

    expect(page.items).toHaveLength(MAX_PAGE_SIZE);
    expect(page.page.hasMore).toBe(false);
    expect(loadBlock.mock.calls).toEqual([[0], [BLOCK_SIZE]]);
  });
});
