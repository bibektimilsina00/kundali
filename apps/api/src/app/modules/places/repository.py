"""Read-only queries against the GeoNames index.

Its own SQLite file rather than the application database: it is derived data,
rebuilt wholesale by `scripts/build_places.py`, and nothing writes to it at
runtime. Putting it in Postgres would mean a 117MB migration for data that a
script can regenerate in two minutes.
"""

from __future__ import annotations

import sqlite3
import unicodedata
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[4] / "data" / "places.sqlite3"

_connection: sqlite3.Connection | None = None


class PlaceIndexMissing(RuntimeError):
    pass


def _connect() -> sqlite3.Connection:
    global _connection
    if _connection is None:
        if not DB_PATH.exists():
            raise PlaceIndexMissing(
                f"place index not found at {DB_PATH}. "
                "Build it with: uv run python scripts/build_places.py"
            )
        # check_same_thread=False: the connection is read-only and shared across
        # the thread pool FastAPI runs sync handlers on.
        _connection = sqlite3.connect(DB_PATH, check_same_thread=False)
        _connection.row_factory = sqlite3.Row
    return _connection


def normalise(text: str) -> str:
    """Match the fold used when the index was built, so 'pokhara' finds 'Pokharā'."""
    folded = unicodedata.normalize("NFKD", text)
    return "".join(c for c in folded if not unicodedata.combining(c)).lower().strip()


def search(query: str, limit: int = 20) -> list[sqlite3.Row]:
    term = normalise(query)
    if len(term) < 2:
        return []

    # Prefix match on the indexed alias table. Ranking puts an exact name match
    # first, then the largest place — typing "delhi" should surface Delhi, not
    # a hamlet whose alias happens to start with it.
    return _connect().execute(
        """
        SELECT p.*, MIN(LENGTH(a.term)) AS best_len,
               MAX(a.term = ?) AS exact,
               -- The alias that actually matched. Typing "lumbini" must not
               -- return a result labelled only "Rummin-dei".
               (SELECT a2.term FROM alias a2
                 WHERE a2.place_id = p.id AND a2.term >= ? AND a2.term < ?
                 ORDER BY LENGTH(a2.term) ASC LIMIT 1) AS matched_term
        FROM alias a
        JOIN place p ON p.id = a.place_id
        WHERE a.term >= ? AND a.term < ?
        GROUP BY p.id
        ORDER BY exact DESC, p.population DESC, best_len ASC, p.name ASC
        LIMIT ?
        """,
        (term, term, term + "￿", term, term + "￿", limit),
    ).fetchall()


def count() -> int:
    return _connect().execute("SELECT COUNT(*) FROM place").fetchone()[0]
