from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    handle: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    avatar_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    travel_tagline: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    bio: Mapped[str] = mapped_column(Text, nullable=False, default="")
    home_city: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    favorite_transport: Mapped[str] = mapped_column(String(32), nullable=False, default="Пешком")
    visited_cities: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    is_admin: Mapped[bool] = mapped_column(default=False, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    routes: Mapped[list["Route"]] = relationship(back_populates="owner", cascade="all, delete-orphan")
    saved_routes: Mapped[list["RouteSave"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    posts: Mapped[list["Post"]] = relationship(back_populates="owner", cascade="all, delete-orphan")
    liked_posts: Mapped[list["PostLike"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    saved_posts: Mapped[list["PostSave"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    comments: Mapped[list["PostComment"]] = relationship(back_populates="owner", cascade="all, delete-orphan")


class Route(Base):
    __tablename__ = "routes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    cities: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    origin_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    origin_lat: Mapped[float] = mapped_column(nullable=False, default=0)
    origin_lon: Mapped[float] = mapped_column(nullable=False, default=0)
    destination_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    destination_lat: Mapped[float] = mapped_column(nullable=False, default=0)
    destination_lon: Mapped[float] = mapped_column(nullable=False, default=0)
    waypoints_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    route_geojson: Mapped[str | None] = mapped_column(Text, nullable=True)
    distance_km: Mapped[float] = mapped_column(nullable=False, default=0)
    route_type: Mapped[str] = mapped_column(String(16), nullable=False, default="schematic")
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    transport: Mapped[str] = mapped_column(String(32), nullable=False, default="Пешком")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    owner: Mapped[User] = relationship(back_populates="routes")
    saves: Mapped[list["RouteSave"]] = relationship(back_populates="route", cascade="all, delete-orphan")


class RouteSave(Base):
    __tablename__ = "route_saves"
    __table_args__ = (UniqueConstraint("route_id", "user_id", name="uq_route_save_route_user"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    route_id: Mapped[int] = mapped_column(ForeignKey("routes.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    route: Mapped[Route] = relationship(back_populates="saves")
    user: Mapped[User] = relationship(back_populates="saved_routes")


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(128), nullable=False)
    transport: Mapped[str] = mapped_column(String(32), nullable=False, default="Пешком")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    owner: Mapped[User] = relationship(back_populates="posts")
    likes: Mapped[list["PostLike"]] = relationship(back_populates="post", cascade="all, delete-orphan")
    saves: Mapped[list["PostSave"]] = relationship(back_populates="post", cascade="all, delete-orphan")
    comments: Mapped[list["PostComment"]] = relationship(back_populates="post", cascade="all, delete-orphan")


class PostLike(Base):
    __tablename__ = "post_likes"
    __table_args__ = (UniqueConstraint("post_id", "user_id", name="uq_post_like_post_user"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    post: Mapped[Post] = relationship(back_populates="likes")
    user: Mapped[User] = relationship(back_populates="liked_posts")


class PostSave(Base):
    __tablename__ = "post_saves"
    __table_args__ = (UniqueConstraint("post_id", "user_id", name="uq_post_save_post_user"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    post: Mapped[Post] = relationship(back_populates="saves")
    user: Mapped[User] = relationship(back_populates="saved_posts")


class PostComment(Base):
    __tablename__ = "post_comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    post: Mapped[Post] = relationship(back_populates="comments")
    owner: Mapped[User] = relationship(back_populates="comments")
