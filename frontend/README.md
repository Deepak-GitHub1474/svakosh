# Svakosh frontend

SvelteKit + TypeScript + Tailwind CSS v4 + pnpm.

## Scripts

- `pnpm dev` — dev server (default port 5173)
- `pnpm build` — production build (adapter-node)
- `pnpm preview` — preview production build
- `pnpm check` — `svelte-check`
- `pnpm lint` — Prettier + ESLint
- `pnpm validate` — check + lint + build

## Environment (server-only)

Set in `.env` (not committed). Loaded in `+layout.server.ts` via `$env/dynamic/private`:

| Variable          | Purpose       | Example                 |
| ----------------- | ------------- | ----------------------- |
| `SVAKOSH_API_URL` | REST base URL | `http://127.0.0.1:8000` |
| `SVAKOSH_WS_URL`  | WebSocket URL | `ws://127.0.0.1:8000`   |

If unset, dev defaults to `127.0.0.1:8000`; prod build defaults to `https://api.svakosh.com` (see `src/lib/config/presets.ts`).

Use `data.backend` from layout load in pages: `let { data } = $props();` then `data.backend.apiUrl`, etc.

## Project docs

Product/requirements may live in a parent monorepo as `SVAKOSH-PROJECT.md` / `SVAKOSH-IMPLEMENTATION-STATUS.md` — copy into your repo or open from the workspace root if applicable.

## Health

`GET /health` returns `{ ok: true }`.

## Git — commit prefixes

| Prefix | Use when |
| ------ | -------- |
| `feat:` | New API behavior clients can rely on |
| `fix:` | Bug fixes, no new feature |
| `refactor:` | Internal structure; same external behavior |
| `optimization:` | Performance; same API contract |
| `style:` | Formatting, logs, OpenAPI text only |
| `docs:` | Documentation only |
