from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    APP_NAME: str
    APP_VERSION: str
    API_PREFIX: str
    API_ENV: str
    HOST: str
    PORT: int
    MONGODB_URI: str
    MONGODB_DB_NAME: str
    REDIS_URL: str
    CORS_ORIGINS: str


@lru_cache
def get_settings() -> Settings:
    return Settings()
