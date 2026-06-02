"""Shared pytest fixtures."""

from __future__ import annotations

import contextlib
import os
import sys
import tempfile
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


@pytest.fixture(autouse=True)
def temp_db(monkeypatch):
    """Use a fresh temp SQLite file for every test."""
    fd, path = tempfile.mkstemp(prefix="passgen-test-", suffix=".sqlite3")
    os.close(fd)
    monkeypatch.setenv("PASSGEN_DB_PATH", path)
    from app import db as _db  # noqa: WPS433  (deferred import: env var must be set first)

    _db.init_db()
    yield path
    with contextlib.suppress(OSError):
        os.remove(path)


@pytest.fixture()
def client(temp_db):
    """FastAPI test client wired to the temp DB fixture."""
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as c:
        yield c
