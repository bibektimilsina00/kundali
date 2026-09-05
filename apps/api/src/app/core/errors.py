"""One error hierarchy, one handler, one response shape.

The wire shape is `{"error": {"code", "message", "details"}}` for every failure
(docs/architecture.md §7). `code` is stable and for the client to switch on;
`message` is for a human. Clients must never parse `message`, or a copy edit
becomes a breaking change.
"""

from __future__ import annotations

from typing import Any

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base for everything we raise deliberately."""

    status_code = 500
    code = "internal_error"

    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details or {}


class ValidationError(AppError):
    status_code = 422
    code = "validation_error"


class NotFoundError(AppError):
    status_code = 404
    code = "not_found"


class CalculationError(AppError):
    """The ephemeris refused. Never swallowed: a wrong chart that looks right
    is worse than no chart (docs/astrology-methodology.md)."""

    status_code = 422
    code = "calculation_failed"


def _body(code: str, message: str, details: dict[str, Any] | None = None) -> dict[str, Any]:
    return {"error": {"code": code, "message": message, "details": details or {}}}


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_error(_: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=_body(exc.code, exc.message, exc.details),
        )

    @app.exception_handler(RequestValidationError)
    async def _request_validation(_: Request, exc: RequestValidationError) -> JSONResponse:
        # FastAPI's default 422 body is a bare list, which does not match the
        # envelope every client parses. Reshape it.
        details = {
            ".".join(str(p) for p in err["loc"][1:]): err["msg"]
            for err in exc.errors()
        }
        return JSONResponse(
            status_code=422,
            content=jsonable_encoder(
                _body("validation_error", "Some fields need correcting.", details)
            ),
        )

    @app.exception_handler(Exception)
    async def _unhandled(_: Request, exc: Exception) -> JSONResponse:
        # Never leak a traceback: birth data reaches these code paths and must
        # not appear in an error payload (CLAUDE.md rule 9).
        return JSONResponse(
            status_code=500,
            content=_body("internal_error", "Something went wrong."),
        )
