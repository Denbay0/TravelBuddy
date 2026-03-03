from datetime import datetime
import re

from pydantic import AliasChoices, EmailStr, Field, field_validator, model_validator

from app.schemas.common import CamelModel
from app.utils_profile import normalize_username

PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$")
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 72


class UserCreate(CamelModel):
    name: str = Field(validation_alias=AliasChoices("name", "username"))
    email: EmailStr
    password: str = Field(min_length=PASSWORD_MIN_LENGTH, max_length=PASSWORD_MAX_LENGTH)
    confirm_password: str = Field(
        validation_alias=AliasChoices("confirmPassword", "confirm_password", "repeat_password")
    )

    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("Name must be a string")
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
        if len(value) > PASSWORD_MAX_LENGTH:
            raise ValueError(
                f"Password must be at most {PASSWORD_MAX_LENGTH} characters (bcrypt limit)"
            )
        if not PASSWORD_REGEX.fullmatch(value):
            raise ValueError(
                "Password must include at least one lowercase letter, one uppercase letter, and one digit"
            )
        return value

    @model_validator(mode="after")
    def passwords_match(self) -> "UserCreate":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class ProfileUpdateRequest(CamelModel):
    name: str | None = None
    travel_tagline: str | None = None
    bio: str | None = None
    home_city: str | None = None

    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not isinstance(value, str):
            raise ValueError("Name must be a string")
        return normalize_username(value)


class UserOut(CamelModel):
    model_config = CamelModel.model_config | {"from_attributes": True}

    id: int
    name: str
    username: str | None = None
    email: EmailStr
    handle: str
    avatar_url: str
    created_at: datetime

    @model_validator(mode="after")
    def ensure_username(self) -> "UserOut":
        if not self.username:
            self.username = self.name
        return self


class RegisterResponse(CamelModel):
    message: str
    user: UserOut
    csrf_token: str
    csrf_token_legacy: str | None = Field(default=None, serialization_alias="csrf_token")

    @model_validator(mode="after")
    def ensure_legacy_csrf(self) -> "RegisterResponse":
        if not self.csrf_token_legacy:
            self.csrf_token_legacy = self.csrf_token
        return self


class ProfileStats(CamelModel):
    trips: int
    posts: int
    saved_routes: int


class ProfileFavoriteRouteItem(CamelModel):
    id: str
    title: str
    cities: list[str]
    duration_days: int


class ProfilePostItem(CamelModel):
    id: str
    title: str
    city: str
    created_at: datetime


class ProfileMeResponse(CamelModel):
    id: int
    name: str
    email: EmailStr
    handle: str
    avatar_url: str
    travel_tagline: str
    bio: str
    home_city: str
    visited_cities: list[str]
    stats: ProfileStats
    favorite_routes: list[ProfileFavoriteRouteItem]
    created_at: datetime


class ProfileUpdateResponse(CamelModel):
    message: str
    profile: ProfileMeResponse


class ProfileAvatarUploadResponse(CamelModel):
    message: str
    avatar_url: str


class ProfilePostsPageResponse(CamelModel):
    page: int
    limit: int
    total: int
    items: list[ProfilePostItem]


class ProfileFavoriteRoutesPageResponse(CamelModel):
    page: int
    limit: int
    total: int
    items: list[ProfileFavoriteRouteItem]
