"""Test-wide environment. Imported before anything that builds Settings or an engine.

Three things must be true before the first import of `app.*`:

1. `Settings.JWT_SECRET` has no default and rejects anything under 32 chars.
2. `DATABASE_URL` must point somewhere disposable. Without it the suite reads and
   writes the developer's real vault, which makes tests order-dependent and is a
   nasty surprise on a machine with real data.
3. The schema has to exist. Production migrates (`make migrate`); tests build it
   from `SQLModel.metadata`, and `test_migrations.py` asserts the two agree.
"""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

os.environ.setdefault("JWT_SECRET", "test-secret-not-used-anywhere-real-0123456789abcdef")
_TEST_DB = Path(tempfile.mkdtemp(prefix="kundali-test-")) / "vault.sqlite3"
os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB}"

from app.core.db import create_all  # noqa: E402

create_all()
