#!/usr/bin/env python
"""Build the place-search index from GeoNames.

Not committed — the output is a ~100MB SQLite file, so it is fetched and built
the same way the ephemeris data files are (see .gitignore).

    uv run python scripts/build_places.py

Coverage is deliberately uneven, because the data is:

* Every populated place in **Nepal and India**, the launch market. Population
  filtering is useless there — Nepal has 87,921 populated places in GeoNames
  and only 84 carry a population figure, which is why the standard cities1000
  extract contains 74 Nepali places and misses most villages.
* Every place worldwide with population >= 1000 elsewhere.

Aliases matter as much as names: Lumbini is recorded by GeoNames under the
primary name "Rummin-dei", with Lumbini only in its alternate-names column.
Searching primary names alone would make it unfindable.
"""

from __future__ import annotations

import io
import re
import sqlite3
import unicodedata
import urllib.request
import zipfile
from pathlib import Path

BASE = "https://download.geonames.org/export/dump/"
ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "places.sqlite3"

# Countries where we keep every populated place rather than population >= 1000.
FULL_COVERAGE = ("NP", "IN")
WORLD_DUMP = "cities1000"

LATIN = re.compile(r"^[\x20-\x7EÀ-ɏ'’.\- ]+$")
MAX_ALIASES = 8


def fetch(name: str) -> str:
    url = f"{BASE}{name}.zip"
    print(f"  downloading {name}.zip …", flush=True)
    with urllib.request.urlopen(url, timeout=300) as response:  # noqa: S310
        data = response.read()
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        return archive.read(f"{name}.txt").decode("utf-8")


def fetch_plain(name: str) -> str:
    with urllib.request.urlopen(f"{BASE}{name}", timeout=120) as response:  # noqa: S310
        return response.read().decode("utf-8")


def _best_aliases(primary: str, column: str) -> list[str]:
    """Pick the alternate names a person would actually type.

    GeoNames lists alternates alphabetically, not by usefulness: New York City
    carries 97 of them and "New York" sits at position 25, behind "Aebura",
    "Big Apple" and "Cathair Nua-Eabhrac". Taking the first few by position
    therefore loses the one name everybody uses.

    Rank instead by how many words an alias shares with the primary name, then
    by brevity — which surfaces "New York" and drops the Cornish rendering.
    """
    primary_words = set(normalise(primary).split())
    candidates: list[tuple[int, int, str]] = []
    for raw in column.split(","):
        alt = raw.strip()
        if not alt or not LATIN.match(alt):
            continue
        term = normalise(alt)
        if not term:
            continue
        shared = len(primary_words & set(term.split()))
        candidates.append((-shared, len(term), term))
    candidates.sort()
    return [term for _, _, term in candidates[:MAX_ALIASES]]


def normalise(text: str) -> str:
    """Lowercase and strip accents, so 'Pokharā' matches a typed 'pokhara'."""
    folded = unicodedata.normalize("NFKD", text)
    return "".join(c for c in folded if not unicodedata.combining(c)).lower().strip()


def admin1_names() -> dict[str, str]:
    out: dict[str, str] = {}
    for line in fetch_plain("admin1CodesASCII.txt").splitlines():
        parts = line.split("\t")
        if len(parts) >= 2:
            out[parts[0]] = parts[1]
    return out


def country_names() -> dict[str, str]:
    out: dict[str, str] = {}
    for line in fetch_plain("countryInfo.txt").splitlines():
        if line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) >= 5:
            out[parts[0]] = parts[4]
    return out


FUZZY_MIN_POPULATION = 1000


def main() -> int:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    if DB_PATH.exists():
        DB_PATH.unlink()

    print("fetching lookups …", flush=True)
    admin1 = admin1_names()
    countries = country_names()

    db = sqlite3.connect(DB_PATH)
    db.executescript("""
        PRAGMA journal_mode = OFF;
        PRAGMA synchronous = OFF;
        CREATE TABLE place (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            admin1 TEXT NOT NULL DEFAULT '',
            country TEXT NOT NULL DEFAULT '',
            country_code TEXT NOT NULL DEFAULT '',
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            tz_name TEXT NOT NULL,
            population INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE alias (term TEXT NOT NULL, place_id INTEGER NOT NULL);
    """)

    seen: set[int] = set()
    total = 0

    def ingest(text: str, *, keep_all: bool) -> None:
        nonlocal total
        places, aliases = [], []
        for line in text.splitlines():
            c = line.split("\t")
            if len(c) < 19 or c[6] != "P":
                continue
            gid = int(c[0])
            if gid in seen:
                continue
            tz = c[17].strip()
            if not tz:
                continue  # a place with no zone cannot produce a correct chart
            population = int(c[14]) if c[14].isdigit() else 0
            if not keep_all and population < 1000:
                continue
            seen.add(gid)

            name = c[1] or c[2]
            country_code = c[8]
            places.append((
                gid, name,
                admin1.get(f"{country_code}.{c[10]}", ""),
                countries.get(country_code, country_code),
                country_code,
                float(c[4]), float(c[5]), tz, population,
            ))

            terms = {normalise(name), normalise(c[2] or name)}
            terms.update(_best_aliases(name, c[3]))
            aliases.extend((t, gid) for t in terms if t)

        db.executemany("INSERT OR IGNORE INTO place VALUES (?,?,?,?,?,?,?,?,?)", places)
        db.executemany("INSERT INTO alias VALUES (?,?)", aliases)
        db.commit()
        total += len(places)
        print(f"    +{len(places):,} places (total {total:,})", flush=True)

    for code in FULL_COVERAGE:
        print(f"{code}: every populated place", flush=True)
        ingest(fetch(code), keep_all=True)

    print(f"{WORLD_DUMP}: worldwide, population >= 1000", flush=True)
    ingest(fetch(WORLD_DUMP), keep_all=False)

    print("indexing …", flush=True)
    db.executescript("""
        CREATE INDEX idx_alias_term ON alias(term);
        CREATE INDEX idx_place_pop ON place(population DESC);
    """)

    # Spelling tolerance. Restricted to places anyone is plausibly born in —
    # indexing all 786k would triple the file for hamlets nobody misspells.
    print("building the spelling index …", flush=True)
    db.executescript(f"""
        CREATE VIRTUAL TABLE fuzzy USING fts5(term, tokenize='trigram');
        INSERT INTO fuzzy(term)
          SELECT DISTINCT a.term FROM alias a JOIN place p ON p.id = a.place_id
           WHERE p.population >= {FUZZY_MIN_POPULATION};
    """)
    db.execute("ANALYZE")
    db.commit()
    db.close()

    size_mb = DB_PATH.stat().st_size / 1e6
    print(f"\nwrote {DB_PATH.relative_to(ROOT)}  —  {total:,} places, {size_mb:.0f} MB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
