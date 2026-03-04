import json
from typing import Any, Literal

from pydantic import Field, field_validator
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

    app_base_url: str = "http://127.0.0.1:8000"
    frontend_origins: list[str] | str = ["http://127.0.0.1:5173", "http://localhost:5173"]
    cors_allow_origins: list[str] | str = ["http://127.0.0.1:5173", "http://localhost:5173"]

    env: Literal["dev", "test", "prod"] = "dev"
    debug: bool = False

    @field_validator("frontend_origins", "cors_allow_origins", mode="before")
    @classmethod
    def parse_origins(cls, value: Any) -> Any:
        if value is None:
            return []

        if isinstance(value, (list, tuple, set)):
            return [str(item).strip() for item in value if str(item).strip()]

        if isinstance(value, str):
            raw = value.strip()
            if not raw:
                return []

            if raw.startswith("["):
                try:
                    parsed = json.loads(raw)
                except json.JSONDecodeError:
                    parsed = None

                if isinstance(parsed, list):
                    return [str(item).strip() for item in parsed if str(item).strip()]

            return [item.strip().strip("[]") for item in raw.replace("\n", ",").split(",") if item.strip().strip("[]") ]

        return value

    @field_validator("frontend_origins", "cors_allow_origins", mode="after")
    @classmethod
    def ensure_origin_list(cls, value: list[str] | str) -> list[str]:
        if isinstance(value, str):
            return cls.parse_origins(value)
        return value

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
