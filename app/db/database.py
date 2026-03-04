from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    pass


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _ensure_user_columns() -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("users")}
    required_columns = {
        "handle": "VARCHAR(32)",
        "avatar_path": "VARCHAR(255)",
        "travel_tagline": "VARCHAR(255) NOT NULL DEFAULT ''",
        "bio": "TEXT NOT NULL DEFAULT ''",
        "home_city": "VARCHAR(128) NOT NULL DEFAULT ''",
        "favorite_transport": "VARCHAR(32) NOT NULL DEFAULT 'Пешком'",
        "visited_cities": "TEXT NOT NULL DEFAULT '[]'",
        "is_admin": "BOOLEAN NOT NULL DEFAULT FALSE",
    }

    with engine.begin() as connection:
        for column_name, column_definition in required_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {column_definition}"))


def _ensure_route_columns() -> None:
    inspector = inspect(engine)
    if "routes" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("routes")}
    required_columns = {
        "origin_name": "VARCHAR(255) NOT NULL DEFAULT ''",
        "origin_lat": "DOUBLE PRECISION NOT NULL DEFAULT 0",
        "origin_lon": "DOUBLE PRECISION NOT NULL DEFAULT 0",
        "destination_name": "VARCHAR(255) NOT NULL DEFAULT ''",
        "destination_lat": "DOUBLE PRECISION NOT NULL DEFAULT 0",
        "destination_lon": "DOUBLE PRECISION NOT NULL DEFAULT 0",
        "waypoints_json": "TEXT NOT NULL DEFAULT '[]'",
        "route_geojson": "TEXT",
        "distance_km": "DOUBLE PRECISION NOT NULL DEFAULT 0",
        "route_type": "VARCHAR(16) NOT NULL DEFAULT 'schematic'",
    }

    with engine.begin() as connection:
        for column_name, column_definition in required_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE routes ADD COLUMN {column_name} {column_definition}"))


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
    _ensure_user_columns()
    _ensure_route_columns()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
