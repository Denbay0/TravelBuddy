from pydantic import AliasChoices, Field, field_validator, model_validator

from app.schemas.common import CamelModel
from app.schemas.user import UserOut

PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 72


class LoginRequest(CamelModel):
    email: str | None = Field(default=None, min_length=3, max_length=255)
    username_or_email: str | None = Field(default=None, validation_alias=AliasChoices("username_or_email", "usernameOrEmail"))
    password: str = Field(min_length=PASSWORD_MIN_LENGTH, max_length=PASSWORD_MAX_LENGTH)
    remember_me: bool = False

    @field_validator("email", "username_or_email", mode="before")
    @classmethod
    def normalize_email(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not isinstance(value, str):
            raise ValueError("email must be a string")
        normalized = value.strip().lower()
        if not normalized:
            raise ValueError("email cannot be empty")
        return normalized

    @model_validator(mode="after")
    def ensure_login_identifier(self) -> "LoginRequest":
        identifier = self.email or self.username_or_email
        if not identifier:
            raise ValueError("email or usernameOrEmail is required")
        self.email = identifier
        self.username_or_email = identifier
        return self

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        if len(value) > PASSWORD_MAX_LENGTH:
            raise ValueError(
                f"Password must be at most {PASSWORD_MAX_LENGTH} characters (bcrypt limit)"
            )
        return value


class LoginResponse(CamelModel):
    message: str
    user: UserOut
    csrf_token: str
    csrf_token_legacy: str | None = Field(default=None, serialization_alias="csrf_token")

    @model_validator(mode="after")
    def ensure_legacy_csrf(self) -> "LoginResponse":
        if not self.csrf_token_legacy:
            self.csrf_token_legacy = self.csrf_token
        return self


class CsrfResponse(CamelModel):
    csrf_token: str
    csrf_token_legacy: str | None = Field(default=None, serialization_alias="csrf_token")

    @model_validator(mode="after")
    def ensure_legacy_csrf(self) -> "CsrfResponse":
        if not self.csrf_token_legacy:
            self.csrf_token_legacy = self.csrf_token
        return self


class MessageResponse(CamelModel):
    message: str
