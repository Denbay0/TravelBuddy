from datetime import datetime
import re

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.utils_profile import normalize_username

PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$")


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    repeat_password: str

    @field_validator("username", mode="before")
    @classmethod
    def validate_username(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("Username must be a string")
        return normalize_username(value)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("Email must be a string")
        normalized = value.strip().lower()
        if not normalized:
            raise ValueError("Email cannot be empty")
        return normalized

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not PASSWORD_REGEX.fullmatch(value):
            raise ValueError(
                "Password must include at least one lowercase letter, one uppercase letter, and one digit"
            )
        return value

    @model_validator(mode="after")
    def passwords_match(self) -> "UserCreate":
        if self.password != self.repeat_password:
            raise ValueError("Passwords do not match")
        return self


class ProfileUpdateRequest(BaseModel):
    username: str

    @field_validator("username", mode="before")
    @classmethod
    def validate_username(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("Username must be a string")
        return normalize_username(value)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: EmailStr
    handle: str
    avatar_url: str
    created_at: datetime


class RegisterResponse(BaseModel):
    message: str
    user: UserOut
