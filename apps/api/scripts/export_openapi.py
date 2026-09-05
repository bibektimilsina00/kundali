#!/usr/bin/env python
"""Emit the OpenAPI spec to stdout, deterministically.

Committed to contracts/ and CI-diffed, so it must be byte-stable across runs
and machines — hence sorted keys and a fixed indent. An unstable dump would
make `make contract-check` fail at random and train everyone to ignore it.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from app.main import create_app  # noqa: E402


def main() -> int:
    json.dump(create_app().openapi(), sys.stdout, indent=2, sort_keys=True)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
