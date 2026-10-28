# Svakosh — Web

SvelteKit app: server-rendered pages plus the `/api/**` proxy routes that forward to the backend with HTTP-only cookies. See the [root README](../README.md) for the system architecture.

**Stack:** SvelteKit · Svelte 5 · TypeScript · Tailwind CSS v4 · pnpm

## Scripts

| Command         | What it does                                                        |
| --------------- | ------------------------------------------------------------------- |
| `pnpm dev`      | Dev server on `http://localhost:5173`                               |
| `pnpm build`    | Production build (Vercel adapter on Vercel, Node adapter elsewhere) |
| `pnpm check`    | `svelte-check`                                                      |
| `pnpm lint`     | Prettier + ESLint                                                   |
| `pnpm validate` | check + lint + build                                                |

## Environment

Set in `frontend/.env` (never committed). `.env.example` lists every key.

| Variable                     | Purpose                                                                                        |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `PUBLIC_SVAKOSH_APP_ENV`     | `development` or `production`; picks the API and WebSocket URLs in `src/lib/config/presets.ts` |
| `PUBLIC_GOOGLE_CLIENT_ID`    | Google sign-in client ID                                                                       |
| `PUBLIC_SVAKOSH_MOBILE_AUTH` | `true` enables mobile OTP sign-in                                                              |

Razorpay needs no frontend key; the API returns it with each checkout.
