## Svakosh — API

**Stack:** Python 3.13 · FastAPI · MongoDB (Motor) · Redis · **uv**

### Setup

1. Install [uv](https://docs.astral.sh/uv/).
2. From **`backend/`**: `uv sync` (installs everything from **`uv.lock`** into **`.venv`**).
3. To add or remove a runtime dependency, use **`uv add <package>`** or **`uv remove <package>`** from **`backend/`** — do not use **`pip install`** for project dependencies.
4. Copy or create **`backend/.env`** (see variables below). All keys are required.

### Run

From **`backend/`**:

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Health:** `GET /health` (server health).

## Environment (`.env`)

| Variable | Purpose |
| -------- | ------- |
| `APP_NAME` | API title |
| `APP_VERSION` | Version string |
| `API_PREFIX` | e.g. `/api` |
| `API_ENV` | e.g. `development` |
| `HOST` | Bind host |
| `PORT` | Port |
| `MONGODB_URI` | Mongo connection URI |
| `MONGODB_DB_NAME` | Database name |
| `REDIS_URL` | Redis URL |
| `CORS_ORIGINS` | Comma-separated origins |

## Git — commit prefixes

| Prefix | Use when |
| ------ | -------- |
| `feat:` | New API behavior clients can rely on |
| `fix:` | Bug fixes, no new feature |
| `refactor:` | Internal structure; same external behavior |
| `optimization:` | Performance; same API contract |
| `style:` | Formatting, logs, OpenAPI text only |
| `docs:` | Documentation only |

After any dependency change (**`uv add`** / **`uv remove`** / manual edits to **`pyproject.toml`**), run **`uv sync`** and commit **`pyproject.toml`** and **`uv.lock`** together.
