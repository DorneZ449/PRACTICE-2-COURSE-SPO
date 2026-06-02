"""SQLite persistence layer for PassGen Pro."""

from __future__ import annotations

import os
import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_DB_PATH = BASE_DIR / "passgen.sqlite3"


def _resolve_db_path() -> Path:
    """Allow overriding the database path via env var (e.g. for tests)."""
    override = os.environ.get("PASSGEN_DB_PATH")
    return Path(override) if override else DEFAULT_DB_PATH


@contextmanager
def get_connection() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(_resolve_db_path())
    try:
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    """Create tables on application startup. Idempotent."""
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS password_history (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                password        TEXT    NOT NULL,
                length          INTEGER NOT NULL,
                use_lowercase   INTEGER NOT NULL,
                use_uppercase   INTEGER NOT NULL,
                use_digits      INTEGER NOT NULL,
                use_symbols     INTEGER NOT NULL,
                type_summary    TEXT    NOT NULL,
                strength_label  TEXT    NOT NULL,
                strength_score  INTEGER NOT NULL,
                entropy_bits    REAL    NOT NULL DEFAULT 0,
                created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
            )
            """
        )
        # Add columns introduced in later versions if the DB pre-existed.
        existing = {row["name"] for row in conn.execute("PRAGMA table_info(password_history)")}
        if "entropy_bits" not in existing:
            conn.execute(
                "ALTER TABLE password_history ADD COLUMN entropy_bits REAL NOT NULL DEFAULT 0"
            )


def save_password(
    *,
    password: str,
    length: int,
    use_lowercase: bool,
    use_uppercase: bool,
    use_digits: bool,
    use_symbols: bool,
    type_summary: str,
    strength_label: str,
    strength_score: int,
    entropy_bits: float = 0.0,
) -> int:
    """Persist a generated password and return its row id."""
    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO password_history (
                password, length,
                use_lowercase, use_uppercase, use_digits, use_symbols,
                type_summary, strength_label, strength_score, entropy_bits
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                password,
                length,
                int(use_lowercase),
                int(use_uppercase),
                int(use_digits),
                int(use_symbols),
                type_summary,
                strength_label,
                strength_score,
                float(entropy_bits),
            ),
        )
        return int(cur.lastrowid or 0)


def get_history(limit: int = 50, offset: int = 0) -> list[dict[str, object]]:
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT * FROM password_history
            ORDER BY id DESC
            LIMIT ? OFFSET ?
            """,
            (limit, offset),
        ).fetchall()
        return [dict(row) for row in rows]


def history_count() -> int:
    with get_connection() as conn:
        row = conn.execute("SELECT COUNT(*) AS n FROM password_history").fetchone()
        return int(row["n"]) if row else 0


def delete_history_item(item_id: int) -> bool:
    with get_connection() as conn:
        cur = conn.execute("DELETE FROM password_history WHERE id = ?", (item_id,))
        return cur.rowcount > 0


def clear_history() -> int:
    with get_connection() as conn:
        cur = conn.execute("DELETE FROM password_history")
        return cur.rowcount


def latest() -> dict[str, object] | None:
    items = get_history(limit=1)
    return items[0] if items else None
