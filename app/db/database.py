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
    with engine.begin() as connection:
        if "handle" not in existing_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN handle VARCHAR(32)"))
        if "avatar_path" not in existing_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN avatar_path VARCHAR(255)"))


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
    _ensure_user_columns()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
