from datetime import datetime

from pydantic import EmailStr, Field

from app.schemas.common import CamelModel


class AdminLoginRequest(CamelModel):
    email: str
    password: str = Field(min_length=8, max_length=72)


class AdminUserOut(CamelModel):
    id: int
    name: str
    email: EmailStr
    is_admin: bool
    created_at: datetime


class AdminDashboardSummary(CamelModel):
    total_users: int
    total_posts: int
    total_routes: int
    admin_users: int


class AdminUsersResponse(CamelModel):
    items: list[AdminUserOut]


class AdminPostOut(CamelModel):
    id: int
    title: str
    city: str
    author_name: str
    created_at: datetime


class AdminPostsResponse(CamelModel):
    items: list[AdminPostOut]
