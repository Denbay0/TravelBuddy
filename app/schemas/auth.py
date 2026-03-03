from pydantic import BaseModel, Field, field_validator

from app.schemas.user import UserOut

PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 72


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=PASSWORD_MIN_LENGTH, max_length=PASSWORD_MAX_LENGTH)
    rememberMe: bool = False

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("email must be a string")
        normalized = value.strip().lower()
        if not normalized:
            raise ValueError("email cannot be empty")
        return normalized

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        if len(value) > PASSWORD_MAX_LENGTH:
            raise ValueError(
                f"Password must be at most {PASSWORD_MAX_LENGTH} characters (bcrypt limit)"
            )
        return value


class LoginResponse(BaseModel):
    message: str
    user: UserOut
    csrfToken: str


class CsrfResponse(BaseModel):
    csrfToken: str


class MessageResponse(BaseModel):
    message: str
