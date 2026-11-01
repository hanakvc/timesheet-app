# Timesheet app

A small product on top of a rate-limited time-tracking REST API (15 requests per minute):

- **Clients:** browse clients, their projects and their tasks as a tree, and log time on a task.
- **My time entries:** list, create, edit and delete your time entries.

It consists of a **NestJS API** that talks to the upstream API, and a **Next.js** web app.
The browser only talks to the web app, which forwards `/api/*` to the NestJS API.
The upstream API key therefore never reaches the browser.

> Status: all three features are built and tested. Built for desktop browsers.

## Requirements

- Node.js 22 (see `.nvmrc`)
- npm 11. npm 10 crashes while installing this dependency tree (a known npm bug).
  If your global npm is 10, run `npx npm@11 install` instead of `npm install`.

## Getting started

```bash
npm install
```

```bash
cp apps/backend/.env.example apps/backend/.env
```

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

Fill in `UPSTREAM_API_BASE_URL` and `UPSTREAM_API_KEY` in `apps/backend/.env`, with the values from the task description. Then:

```bash
npm run dev
```

| What | URL |
| --- | --- |
| Web app | http://localhost:3000 |
| API | http://localhost:3001/api/v1 |
| API docs (Swagger) | http://localhost:3001/docs |

The API checks its environment at startup and refuses to start if a value is missing or invalid.
Optional settings, with their defaults, are listed in `apps/backend/.env.example`: the upstream's rate limit
(15 per 60 s), how long a request may wait for the next window (8 s), the upstream timeout (8 s) and how long
clients, projects and tasks are cached (5 min).

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Starts the API and the web app together, with reload |
| `npm run build` | Builds both apps |
| `npm run lint` | Lints both apps |
| `npm run format` | Formats both apps with Prettier |
| `npm test` | Runs the unit tests of both apps |
| `npm run test:e2e` | Runs the API end-to-end tests: the real API against a fake upstream, no key or network needed |
| `npm run api:generate` | Writes the API's OpenAPI spec (`apps/backend/openapi.json`) and regenerates the frontend's API client from it |

## API endpoints

All under `/api/v1`. Full details in Swagger at `/docs`.

| Method | Path | Does |
| --- | --- | --- |
| `GET` | `/clients?limit&offset` | A page of clients |
| `GET` | `/clients/:id/projects?limit&offset` | A page of a client's projects |
| `GET` | `/projects/:id/tasks?limit&offset` | A page of a project's tasks |
| `GET` | `/tasks/:id/context` | A task with its project and client |
| `GET` | `/time-entries?limit&offset&sortBy&order` | A page of your time entries (default: newest start first) |
| `POST` | `/time-entries` | Create a time entry |
| `PUT` | `/time-entries/:id` | Update a time entry |
| `DELETE` | `/time-entries/:id` | Delete a time entry |

Lists answer `{ items, page: { limit, offset, hasMore } }`. Errors answer `{ error: { code, message, fields? } }`.
The frontend's API client (types, one function per endpoint, TanStack Query keys) is generated from
this API's OpenAPI spec with Hey API, so the two can't drift apart. After changing an endpoint, run `npm run api:generate`.
The upstream API returns no total count, so `hasMore` is found by asking it for one item more than the page size
(never more than its maximum of 100).

## Project structure

```
apps/
  backend/src/
    upstream/      the only code that calls the upstream API: auth, rate limit, errors, mapping
    catalog/       clients, projects, tasks (cached)
    time-entries/  list, create, update, delete
    common/        pagination, cache, validation, error format
    models/        the data this API returns, one file per model
  frontend/src/
    app/           routes only; each file re-exports a component
    components/    layouts, shared, pages, styled (typography)
    generated/api/ API client generated from the backend's OpenAPI spec (never edited by hand)
    hooks/queries/ data hooks (TanStack Query) that call the services
    services/      one wrapper per API call on the generated client, its error setup, the idempotent delete
    assets/icons/  SVG icons, imported as React components
    constants/ interfaces/ models/ styles/ utils/
```
