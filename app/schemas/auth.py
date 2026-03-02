from pydantic import BaseModel, Field, field_validator


class LoginRequest(BaseModel):
    username_or_email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=72)

    @field_validator("username_or_email", mode="before")
    @classmethod
    def normalize_username_or_email(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("username_or_email must be a string")
        normalized = value.strip()
        if not normalized:
            raise ValueError("username_or_email cannot be empty")
        return normalized


class LoginResponse(BaseModel):
    message: str
    csrf_token: str


class CsrfResponse(BaseModel):
    csrf_token: str


class MessageResponse(BaseModel):
    message: str
