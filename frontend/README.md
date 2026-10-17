# Svakosh frontend

SvelteKit + TypeScript + Tailwind CSS v4 + pnpm.

## Scripts

- `pnpm dev` — dev server (default port 5173)
- `pnpm build` — production build (adapter-node)
- `pnpm preview` — preview production build
- `pnpm check` — `svelte-check`
- `pnpm lint` — Prettier + ESLint
- `pnpm validate` — check + lint + build

## Environment

Set in `.env` (not committed):

| Variable                  | Purpose                  | Example       |
| ------------------------- | ------------------------ | ------------- |
| `PUBLIC_SVAKOSH_APP_ENV`  | Picks the backend preset | `development` |
| `PUBLIC_GOOGLE_CLIENT_ID` | Google sign-in client id |               |

`development` uses `http://127.0.0.1:8000` and `ws://127.0.0.1:8000`; `production` uses the deployed API. Both REST and WebSocket URLs live in `src/lib/config/presets.ts`, read through `resolveBackendConfig()`.

## Project docs

Product/requirements may live in a parent monorepo as `SVAKOSH-PROJECT.md` / `SVAKOSH-IMPLEMENTATION-STATUS.md` — copy into your repo or open from the workspace root if applicable.

## Health

`GET /health` returns `{ ok: true }`.

## Git — commit prefixes

| Prefix          | Use when                                   |
| --------------- | ------------------------------------------ |
| `feat:`         | New API behavior clients can rely on       |
| `fix:`          | Bug fixes, no new feature                  |
| `refactor:`     | Internal structure; same external behavior |
| `optimization:` | Performance; same API contract             |
| `style:`        | Formatting, logs, OpenAPI text only        |
| `docs:`         | Documentation only                         |
