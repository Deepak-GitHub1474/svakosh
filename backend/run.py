import logging

import uvicorn

from app.config import get_settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


def main() -> None:
    s = get_settings()
    reload = s.API_ENV.lower() in ("development", "dev", "local")
    uvicorn.run(
        "app.main:app",
        host=s.HOST,
        port=s.PORT,
        reload=reload,
    )


if __name__ == "__main__":
    main()
