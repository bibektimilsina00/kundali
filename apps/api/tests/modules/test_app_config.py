"""Boot-time and liveness guarantees.

Both of these fail in ways that look like something else: a missing
`CORS_ORIGINS` presents as "the website is broken but the mobile app works", and
a health check that never touches the database keeps an instance in the load
balancer after its connection dies.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings, get_settings
from app.main import app, create_app


def test_jwt_secret_must_be_present_and_long_enough() -> None:
    for secret in ("", "short", "x" * 31):
        with pytest.raises(ValueError, match="JWT_SECRET"):
            Settings(JWT_SECRET=secret, _env_file=None)  # type: ignore[call-arg]

    assert Settings(JWT_SECRET="y" * 32, _env_file=None).JWT_SECRET  # type: ignore[call-arg]


@pytest.mark.parametrize("env", ["staging", "production"])
def test_refuses_to_boot_without_cors_origins_outside_local(
    env: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    settings = get_settings().model_copy(update={"ENV": env, "CORS_ORIGINS": []})
    monkeypatch.setattr("app.main.get_settings", lambda: settings)

    with pytest.raises(RuntimeError, match="CORS_ORIGINS"):
        create_app()


def test_boots_outside_local_once_origins_are_configured(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    settings = get_settings().model_copy(
        update={"ENV": "production", "CORS_ORIGINS": ["https://nakhatra.com"]}
    )
    monkeypatch.setattr("app.main.get_settings", lambda: settings)
    assert create_app() is not None


def test_health_reports_ok_when_the_database_answers() -> None:
    res = TestClient(app).get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_health_reports_degraded_when_the_database_is_gone(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def broken():
        raise RuntimeError("connection closed")

    monkeypatch.setattr("app.main.get_engine", broken)
    res = TestClient(app).get("/health")
    assert res.status_code == 503, "a dead database must take the instance out of rotation"
    assert res.json()["database"] == "unreachable"
