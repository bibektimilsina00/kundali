"""App factory. Routers are mounted here and nowhere else."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.errors import install_error_handlers
from app.modules.kundali.router import router as kundali_router
from app.modules.places.router import router as places_router

API_DESCRIPTION = """
One backend, two clients (web and Flutter).

**Compatibility:** additive changes only within `/v1` — no removed or renamed
fields, no newly-required request fields, no narrowed types. App Store users
stay on old builds for months. Clients must treat unknown enum values as
"other". See docs/architecture.md §7.

**Errors** are always `{"error": {"code", "message", "details"}}`. Switch on
`code`; never parse `message`.
"""


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Kundali API",
        version="0.1.0",
        description=API_DESCRIPTION,
        debug=settings.DEBUG,
    )

    # Local dev only: Flutter web and a Next.js dev server are served from
    # ports that change, and a CORS failure in a browser looks like a network
    # error with no useful message. Native clients (macOS, iOS, Android) do not
    # use CORS at all, so this affects browser testing only.
    origins = settings.CORS_ORIGINS or (["*"] if settings.ENV == "local" else [])
    if origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=False,  # incompatible with allow_origins=['*']
            allow_methods=["*"],
            allow_headers=["*"],
        )

    install_error_handlers(app)
    app.include_router(kundali_router)
    app.include_router(places_router)

    @app.get("/health", tags=["meta"], summary="Liveness probe")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
