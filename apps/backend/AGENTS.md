# Backend (NestJS)

Read the repository rules in `../../AGENTS.md` first.

## Structure

| Folder | Holds |
| --- | --- |
| `src/upstream/` | `UpstreamClient`, the **only** code that calls the upstream API, plus auth, rate limiter, errors and mapper |
| `src/catalog/` | Clients, projects, tasks and task context (cached, 5 minutes by default) |
| `src/time-entries/` | List, create, update, delete (never cached) |
| `src/common/` | Paging (`pagination.ts`) and its query DTO (`pagination.dto.ts`), cache, id pipe, validation exception, error format (`api-error.ts`) and filter, JSON body parsing |
| `src/config/` | Environment variables, validated at startup; optional limits have defaults there |
| `src/models/` | The clean data shapes this API returns, one file per model (`client.model.ts` holds `Client` and `ClientsPage`). Classes with `@ApiProperty`, so they appear in the spec. Shared because the upstream mapper returns them and the features pass them on |

## Conventions

- **Upstream calls go through `UpstreamClient`.** It adds auth, respects the rate limiter, times out, and maps
  responses with `upstream.mapper.ts`. Upstream quirks (`projectId` vs `parent`, `userId`) are handled there only.
- **Authentication goes through an `AuthProvider`** (`auth.provider.ts`). To change how we authenticate (e.g. OAuth),
  add a provider and select it in `upstream.module.ts`; don't touch the client or the endpoints.
- **Retry only on 429.** Never retry a POST after a timeout: it may already have created the entry.
- **Errors:** throw `UpstreamError` (upstream problems) or `ValidationFailedException` (input problems).
  `AllExceptionsFilter` turns everything into `{ error: { code, message, fields? } }`.
- **Validation:** DTOs with class-validator, with messages written for the user, in the frontend's style:
  full sentences (`End must be after start.`), kept in one constant per DTO. Route ids use `ParseIdPipe`
  (whole numbers, 0 allowed).
- **Lists** return `{ items, page: { limit, offset, hasMore } }` via `fetchPage()`, which asks for one item more
  than the page, but never more than the upstream's maximum (`MAX_PAGE_SIZE`, 100). Catalog lists go through
  `pageFromBlocks()`: the upstream is asked for cached blocks of `BLOCK_SIZE` (99, so block plus one is 100) and
  pages are cut from them, so different page sizes and "Load more" share one upstream request. Time entries are
  never cached.
- **Settings:** limits and timings come from `EnvironmentVariables` (`config/env.validation.ts`) through
  `ConfigService`, with defaults there; no numbers are hard-coded in modules.
- **The OpenAPI spec is the frontend's contract.** Every endpoint declares its responses (`@ApiOkResponse({ type })`,
  `@ApiNotFoundResponse`, `@ApiCommonErrors()`), and the method name becomes the operation id, so name methods by what
  they do (`listClients`, `createTimeEntry`). `npm run openapi:export` writes `openapi.json` without starting a server.

## Tests

- Unit tests sit next to the code (`*.spec.ts`); e2e tests in `test/` (`*.e2e-spec.ts`).
- Tests never call the real upstream: stub `fetch` (see `test/app.e2e-spec.ts`).
- Time-dependent code takes `now` / `sleep` as parameters so tests run on a fake clock.
