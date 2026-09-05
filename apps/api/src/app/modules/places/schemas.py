from __future__ import annotations

from pydantic import BaseModel, Field


class PlaceOut(BaseModel):
    id: int = Field(description="GeoNames id — stable, safe to store")
    name: str
    admin1: str = Field(default="", description="State or province")
    country: str = ""
    country_code: str = ""
    latitude: float
    longitude: float
    tz_name: str = Field(
        description="IANA zone. This is the field that matters: it is resolved "
        "here, once, from a dataset — never guessed by the client and never a "
        "UTC offset, which would be wrong for any birth before the zone last "
        "changed."
    )
    matched_as: str = Field(
        default="",
        description="The alternate name that matched, when it differs from the "
        "primary name. GeoNames calls Lumbini 'Rummin-dei'; a result labelled "
        "only by its primary name looks like the wrong place.",
    )
    label: str = Field(description="Display string, e.g. 'Lumbini, Lumbini Province, Nepal'")


class PlaceSearchOut(BaseModel):
    query: str
    results: list[PlaceOut]
