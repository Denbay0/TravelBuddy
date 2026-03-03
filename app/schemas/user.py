from datetime import datetime
import re

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.utils_profile import normalize_username

PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$")
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 72


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=PASSWORD_MIN_LENGTH, max_length=PASSWORD_MAX_LENGTH)
    confirmPassword: str

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
        if self.password != self.confirmPassword:
            raise ValueError("Passwords do not match")
        return self


class ProfileUpdateRequest(BaseModel):
    name: str | None = None
    travelTagline: str | None = None
    bio: str | None = None
    homeCity: str | None = None

    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not isinstance(value, str):
            raise ValueError("Name must be a string")
        return normalize_username(value)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    handle: str
    avatarUrl: str
    createdAt: datetime


class RegisterResponse(BaseModel):
    message: str
    user: UserOut
    csrfToken: str


class ProfileStats(BaseModel):
    trips: int
    posts: int
    savedRoutes: int


class ProfileFavoriteRouteItem(BaseModel):
    id: str
    title: str
    cities: list[str]
    durationDays: int


class ProfilePostItem(BaseModel):
    id: str
    title: str
    city: str
    createdAt: datetime


class ProfileMeResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    handle: str
    avatarUrl: str
    travelTagline: str
    bio: str
    homeCity: str
    visitedCities: list[str]
    stats: ProfileStats
    favoriteRoutes: list[ProfileFavoriteRouteItem]
    createdAt: datetime


class ProfileUpdateResponse(BaseModel):
    message: str
    profile: ProfileMeResponse


class ProfileAvatarUploadResponse(BaseModel):
    message: str
    avatarUrl: str


class ProfilePostsPageResponse(BaseModel):
    page: int
    limit: int
    total: int
    items: list[ProfilePostItem]


class ProfileFavoriteRoutesPageResponse(BaseModel):
    page: int
    limit: int
    total: int
    items: list[ProfileFavoriteRouteItem]
