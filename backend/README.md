# Svakosh — API

FastAPI service for auth, watchlists, analytics, trading, billing and the live WebSocket. See the [root README](../README.md) for the system architecture.

**Stack:** Python 3.13 · FastAPI · MongoDB (Motor) · Redis · NATS · uv

## Run locally

```bash
cp .env.example .env
docker network create dokploy-network   # once
docker compose up -d mongodb mongo-init redis
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

Health check: `GET /health`. Add or remove dependencies with `uv add` / `uv remove`, then commit `pyproject.toml` and `uv.lock` together.

On startup the API creates billing indexes and default plans, and runs an hourly reconcile job guarded by a Redis lock — no external cron is needed.

## Environment

All values go in `backend/.env` (never committed). `.env.example` lists every key.

| Group              | Variables                                                                                                     | Notes                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| App                | `APP_NAME` `APP_VERSION` `API_PREFIX` `API_ENV` `HOST` `PORT` `CORS_ORIGINS`                                  | `API_ENV=development` enables reload      |
| MongoDB            | `MONGO_ROOT_USER` `MONGO_ROOT_PASSWORD` `MONGO_APP_USER` `MONGO_APP_PASSWORD` `MONGODB_URI` `MONGODB_DB_NAME` | Root user is used only by `mongo-init`    |
| Redis              | `REDIS_PASSWORD` `REDIS_URL`                                                                                  | Sessions, OTP, caches, job lock           |
| Market data        | `NATS_URL`                                                                                                    | broker-data-provider                      |
| Trading            | `TRADE_HUB_NATS_URL` `TRADE_LOGIN_REDIRECT_URL`                                                               | trade-hub and the broker login return URL |
| Billing            | `RAZORPAY_KEY_ID` `RAZORPAY_KEY_SECRET` `RAZORPAY_WEBHOOK_SECRET`                                             | Webhook: `<api>/billing/webhook/razorpay` |
| Auth               | `JWT_SECRET` `OTP_HMAC_SECRET` `ENCRYPTION_KEY` `GOOGLE_CLIENT_ID`                                            | Generators are in `.env.example`          |
| Passkeys & cookies | `WEBAUTHN_RP_NAME` `WEBAUTHN_RP_ID` `WEBAUTHN_ORIGIN` `COOKIE_SECURE` `COOKIE_SAMESITE`                       | RP ID/origin must match the frontend host |
| Mail               | `MAIL_PROVIDER` `MAIL_FROM` `SMTP_HOST` `SMTP_PORT` `SMTP_USERNAME` `SMTP_PASSWORD` `SMTP_USE_TLS`            | `console` prints mail instead of sending  |
| SMS                | `SMS_GATEWAY_USER` `SMS_GATEWAY_PASSWORD`                                                                     | Empty logs OTPs only                      |
