"""baseline schema

Revision ID: 847eb7a13dc1
Revises: 
Create Date: 2026-09-06 01:54:36.876324

"""
from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '847eb7a13dc1'
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """The schema as `core.db.init_db()` creates it, expressed as a migration.

    Hand-written: there is no SQLAlchemy metadata to autogenerate from (see
    migrations/env.py). `IF NOT EXISTS` throughout so this can be stamped onto a
    database `init_db()` already populated, which every existing environment is.
    """
    op.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    op.execute("""
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
            tz_name VARCHAR(64),
            place_name VARCHAR(255) NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL,
            kundali_id VARCHAR(64),
            title VARCHAR(255) NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id VARCHAR(64) PRIMARY KEY,
            session_id VARCHAR(64) NOT NULL,
            sender VARCHAR(32) NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_saved_kundalis_user_id ON saved_kundalis(user_id)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id)"
    )


def downgrade() -> None:
    """Deliberately not implemented.

    Downgrading the baseline drops every table and with them every saved chart
    and conversation. If that is genuinely wanted, it is a restore from backup,
    not a migration.
    """
    raise NotImplementedError(
        "Refusing to drop the baseline schema. Restore from a backup instead."
    )
