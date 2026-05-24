from functools import lru_cache
from typing import Literal

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

    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_TTL_MINUTES: int = 30
    REFRESH_TOKEN_TTL_DAYS: int = 7

    OTP_HMAC_SECRET: str
    OTP_LOCKOUT_FAIL_THRESHOLD: int = 5
    OTP_LOCKOUT_MINUTES: int = 15

    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_JWKS_URL: str = "https://www.googleapis.com/oauth2/v3/certs"
    GOOGLE_ISSUERS: str = "https://accounts.google.com,accounts.google.com"

    COOKIE_SECURE: bool = False
    COOKIE_DOMAIN: str | None = None
    COOKIE_SAMESITE: Literal["lax", "strict", "none"] = "lax"
    ACCESS_COOKIE_NAME: str = "svakosh_access_token"
    REFRESH_COOKIE_NAME: str = "svakosh_refresh_token"
    CSRF_COOKIE_NAME: str = "svakosh_csrf"
    CSRF_HEADER_NAME: str = "x-csrf-token"


@lru_cache
def get_settings() -> Settings:
    return Settings()
