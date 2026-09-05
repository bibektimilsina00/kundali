from __future__ import annotations

from app.modules.places import repository
from app.modules.places.schemas import PlaceOut, PlaceSearchOut


def _display_name(row) -> tuple[str, str]:
    """(name to show, alias that matched).

    When the query matched an alternate name, lead with that — it is what the
    user typed and recognises.
    """
    matched = (row["matched_term"] or "").strip()
    primary = row["name"]
    if matched and not repository.normalise(primary).startswith(matched):
        return matched.title(), primary
    return primary, ""


def search_places(query: str, limit: int) -> PlaceSearchOut:
    rows = repository.search(query, limit)
    return PlaceSearchOut(
        query=query,
        results=[
            PlaceOut(
                id=row["id"],
                name=(display := _display_name(row))[0],
                matched_as=display[1],
                admin1=row["admin1"],
                country=row["country"],
                country_code=row["country_code"],
                latitude=row["latitude"],
                longitude=row["longitude"],
                tz_name=row["tz_name"],
                label=", ".join(
                    part for part in (display[0], row["admin1"], row["country"]) if part
                ),
            )
            for row in rows
        ],
    )
