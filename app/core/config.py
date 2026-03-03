from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    secret_key: str = Field(min_length=32)
    algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(default=30, ge=1, le=1440)
    database_url: str = "postgresql+psycopg://travelbuddy:travelbuddy@postgres:5432/travelbuddy"
    redis_url: str = "redis://redis:6379/0"

    jwt_cookie_name: str = "access_token"
    csrf_cookie_name: str = "csrf_token"
    cookie_secure: bool = False
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"
    cookie_path: str = "/"
    cookie_domain: str | None = None
    frontend_origins: str = "http://127.0.0.1:5173"

    media_root: str = "media"
    cors_allow_origins: list[str] = [
        "http://127.0.0.1:5173",
    ]

    env: Literal["dev", "test", "prod"] = "dev"
    debug: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
