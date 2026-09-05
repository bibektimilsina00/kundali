"""Database Connection & Abstraction Layer supporting PostgreSQL (via Docker) and SQLite fallback."""

from __future__ import annotations

import os
import sqlite3
from pathlib import Path
from typing import Any

from app.core.config import get_settings

DB_PATH = Path(__file__).resolve().parents[3] / "data" / "kundali_vault.sqlite3"

_db_wrapper: DBWrapper | None = None


class DBWrapper:
    def __init__(self, is_postgres: bool, conn: Any):
        self.is_postgres = is_postgres
        self.conn = conn

    def _prepare_sql(self, sql: str) -> str:
        if self.is_postgres:
            return sql.replace("?", "%s")
        return sql

    def execute(self, sql: str, params: tuple = ()) -> Any:
        prepared_sql = self._prepare_sql(sql)
        cursor = self.conn.cursor()
        cursor.execute(prepared_sql, params)
        return cursor

    def executescript(self, sql_script: str) -> None:
        if self.is_postgres:
            statements = [s.strip() for s in sql_script.split(";") if s.strip()]
            with self.conn.cursor() as cur:
                for stmt in statements:
                    cur.execute(stmt)
            self.conn.commit()
        else:
            with self.conn:
                self.conn.executescript(sql_script)

    def cursor(self) -> Any:
        return self.conn.cursor()

    def commit(self) -> None:
        self.conn.commit()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.conn.rollback()
        else:
            self.conn.commit()


def get_db() -> DBWrapper:
    global _db_wrapper
    if _db_wrapper is None:
        db_url = os.getenv("DATABASE_URL") or get_settings().DATABASE_URL
        if db_url and db_url.startswith("postgres"):
            try:
                import psycopg2
                import psycopg2.extras

                conn = psycopg2.connect(db_url, cursor_factory=psycopg2.extras.DictCursor)
                _db_wrapper = DBWrapper(is_postgres=True, conn=conn)
                init_db(_db_wrapper)
                return _db_wrapper
            except Exception as e:
                print(f"[DB] Could not connect to Postgres at {db_url} ({e}). Falling back to SQLite.")

        # Fallback to SQLite
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        _db_wrapper = DBWrapper(is_postgres=False, conn=conn)
        init_db(_db_wrapper)

    return _db_wrapper


def init_db(db: DBWrapper) -> None:
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS saved_kundalis (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL,
            name VARCHAR(255) NOT NULL,
            gender VARCHAR(32) NOT NULL DEFAULT 'male',
            dob VARCHAR(32) NOT NULL,
            tob VARCHAR(32) NOT NULL,
            lat DOUBLE PRECISION NOT NULL,
            lon DOUBLE PRECISION NOT NULL,
            tz_offset DOUBLE PRECISION NOT NULL,
            place_name VARCHAR(255) NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS chat_sessions (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL,
            kundali_id VARCHAR(64),
            title VARCHAR(255) NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
            id VARCHAR(64) PRIMARY KEY,
            session_id VARCHAR(64) NOT NULL,
            sender VARCHAR(32) NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        """
    )
