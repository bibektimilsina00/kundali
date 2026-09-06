"""The report endpoint, and specifically when it must NOT trust the model.

A half-formed report renders as broken cards; a three-section report reads as a
truncated reading. In both cases the deterministic generator's seven sections
are strictly better, so the fallback decision is the logic worth testing.
"""

from __future__ import annotations

import json
import uuid
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.modules.report import service

client = TestClient(app)

FIXTURES = Path(__file__).parent / "report_fixtures"
CASE = json.loads((FIXTURES / "charts.json").read_text())[0]
GOOD_REPORT = json.loads((FIXTURES / "expected_reports.json").read_text())["0-en"]


@pytest.fixture
def headers() -> dict[str, str]:
    email = f"report-{uuid.uuid4().hex[:10]}@example.com"
    res = client.post(
        "/v1/auth/signup",
        json={"email": email, "password": "password-8", "full_name": "Report User"},
    )
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def _model_returning(text: str, stop_reason: str = "end_turn"):
    async def create(**_kwargs):
        return SimpleNamespace(
            stop_reason=stop_reason, content=[SimpleNamespace(type="text", text=text)]
        )

    return SimpleNamespace(messages=SimpleNamespace(create=create))


def _post(headers: dict, language: str = "en"):
    return client.post(
        "/v1/report",
        json={"chart": CASE["chart"], "birth": CASE["birth"], "language": language},
        headers=headers,
    )


def test_report_requires_authentication() -> None:
    res = client.post("/v1/report", json={"chart": CASE["chart"], "birth": CASE["birth"]})
    assert res.status_code == 401


def test_model_report_is_used_when_it_is_well_formed(
    headers: dict, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(service, "get_client", lambda: _model_returning(json.dumps(GOOD_REPORT)))
    body = _post(headers).json()
    assert body["source"] == "llm"
    assert [s["id"] for s in body["report"]] == [s["id"] for s in GOOD_REPORT]


@pytest.mark.parametrize(
    "bad,why",
    [
        ("not json at all", "no array"),
        ("[]", "empty"),
        ("[{}, {}, {}]", "too few sections"),
        ('[{"id": "a"}, {"id": "b"}, {"id": "c"}, {"id": "d"}, {"id": "e"}]', "missing fields"),
        ("[1, 2, 3, 4, 5, 6, 7]", "not objects"),
    ],
)
def test_unusable_model_output_falls_back_to_the_full_report(
    headers: dict, monkeypatch: pytest.MonkeyPatch, bad: str, why: str
) -> None:
    monkeypatch.setattr(service, "get_client", lambda: _model_returning(bad))
    body = _post(headers).json()
    assert body["source"] == "rule_engine", why
    assert len(body["report"]) == 7
    assert all(s["content"] for s in body["report"])


def test_refusal_falls_back_rather_than_failing(
    headers: dict, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(service, "get_client", lambda: _model_returning("", "refusal"))
    res = _post(headers)
    assert res.status_code == 200
    assert res.json()["source"] == "rule_engine"


def test_api_failure_falls_back_rather_than_failing(
    headers: dict, monkeypatch: pytest.MonkeyPatch
) -> None:
    from anthropic import APIError

    def boom():
        raise APIError("upstream down", request=None, body=None)  # type: ignore[arg-type]

    monkeypatch.setattr(service, "get_client", boom)
    res = _post(headers)
    assert res.status_code == 200, "a model outage must not deny the user a reading"
    assert res.json()["source"] == "rule_engine"


@pytest.mark.parametrize("language", ["en", "ne", "hi"])
def test_fallback_respects_the_requested_language(
    headers: dict, monkeypatch: pytest.MonkeyPatch, language: str
) -> None:
    monkeypatch.setattr(service, "get_client", lambda: _model_returning("garbage"))
    body = _post(headers, language).json()
    expected = json.loads((FIXTURES / "expected_reports.json").read_text())[f"0-{language}"]
    assert [s["title"] for s in body["report"]] == [s["title"] for s in expected]
