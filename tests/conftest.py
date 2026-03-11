import os
import shutil
import sys
import types
from pathlib import Path
from uuid import uuid4

os.environ.setdefault("SECRET_KEY", "test-secret-key-that-is-long-enough-123")
os.environ.setdefault("ENV", "test")
os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")


def _install_reportlab_stub() -> None:
    if "reportlab" in sys.modules:
        return

    reportlab_module = types.ModuleType("reportlab")
    lib_module = types.ModuleType("reportlab.lib")
    pagesizes_module = types.ModuleType("reportlab.lib.pagesizes")
    pdfgen_module = types.ModuleType("reportlab.pdfgen")
    canvas_module = types.ModuleType("reportlab.pdfgen.canvas")

    pagesizes_module.A4 = (595.27, 841.89)

    class DummyCanvas:
        def __init__(self, *_args, **_kwargs) -> None:
            self._buffer = _args[0]

        def setFont(self, *_args, **_kwargs) -> None:
            return None

        def drawString(self, *_args, **_kwargs) -> None:
            return None

        def showPage(self) -> None:
            return None

        def save(self) -> None:
            self._buffer.write(b"%PDF-1.4\n%%EOF")

    canvas_module.Canvas = DummyCanvas
    reportlab_module.lib = lib_module
    reportlab_module.pdfgen = pdfgen_module
    lib_module.pagesizes = pagesizes_module
    pdfgen_module.canvas = canvas_module

    sys.modules["reportlab"] = reportlab_module
    sys.modules["reportlab.lib"] = lib_module
    sys.modules["reportlab.lib.pagesizes"] = pagesizes_module
    sys.modules["reportlab.pdfgen"] = pdfgen_module
    sys.modules["reportlab.pdfgen.canvas"] = canvas_module


_install_reportlab_stub()

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.db.database import Base, get_db
from app.main import app


@pytest.fixture()
def client(monkeypatch: pytest.MonkeyPatch) -> Generator[TestClient, None, None]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    media_root = Path(".pytest_media") / uuid4().hex
    media_root.mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr(settings, "media_root", str(media_root))

    def override_get_db() -> Generator[Session, None, None]:
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
    shutil.rmtree(media_root, ignore_errors=True)
