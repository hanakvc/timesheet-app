# Working on this repository

Rules for anyone changing this code, people and AI coding agents alike.
`apps/backend/AGENTS.md` and `apps/frontend/AGENTS.md` add the rules for each app.

## What this is

A timesheet app on top of a rate-limited, third-party time-tracking API (called **the upstream API** everywhere):

```
browser → apps/frontend (Next.js, forwards /api/*) → apps/backend (NestJS, /api/v1) → upstream API
```

The browser never talks to the upstream API and never sees its key.

## Commands

npm 11 is required (npm 10 crashes on this dependency tree; use `npx npm@11 install` if needed).

| Command | Does |
| --- | --- |
| `npm install` | Installs both apps (npm workspaces) |
| `npm run dev` | Runs backend (:3001) and frontend (:3000) together |
| `npm test` | Unit tests of both apps |
| `npm run test:e2e` | Backend end-to-end tests: the real API against a fake upstream |
| `npm run lint` | Lints both apps |
| `npm run format` | Formats both apps with Prettier (each app has its own `.prettierrc`) |
| `npm run build` | Builds both apps |
| `npm run api:generate` | Exports the backend's OpenAPI spec and regenerates `apps/frontend/src/generated/api` |

## Rules

- **The upstream allows 15 requests per minute.** Load data only when the user asks for it. Never fetch whole
  hierarchies up front, and never call the upstream in a loop over a list.
- **Never commit secrets.** Real values live only in `apps/backend/.env` (git-ignored); `.env.example` files hold placeholders.
- **Never log time-entry comments or the API key.** Logs carry ids, status codes and timings only.
- **Name the external service "upstream API"** in code, files, packages and docs; never the provider's own name.
- **IDs can be 0** (the upstream has a time entry with id 0). Never test ids with `!id`.

## Done means

1. `npm run format` leaves nothing to change, and `npm run lint` and `npm test` pass (and `npm run test:e2e` for backend changes).
2. After changing an endpoint's path, parameters or response, run `npm run api:generate` and commit the result.
