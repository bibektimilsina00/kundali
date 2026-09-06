"""Report generation: try the model, fall back to the deterministic generator.

The fallback is a full report, not a degraded one — `generator.py` produces the
same seven sections from the same chart. That is why a model failure here
returns 200 with `source: "rule_engine"` rather than an error.
"""

from __future__ import annotations

import json
import logging

from anthropic import APIError
from pydantic import ValidationError

from app.integrations.llm import OUTPUT_CONFIG, THINKING, get_client, model_name
from app.modules.report import generator, prompts
from app.modules.report.schemas import ReportRequest, ReportResponse, ReportSection

logger = logging.getLogger(__name__)

MAX_TOKENS = 8000
MIN_SECTIONS = 5


async def generate_report(req: ReportRequest) -> ReportResponse:
    sections = await _from_model(req)
    if sections:
        return ReportResponse(report=sections, source="llm")
    return ReportResponse(
        report=generator.generate(req.chart, req.birth, req.language),
        source="rule_engine",
    )


async def _from_model(req: ReportRequest) -> list[ReportSection] | None:
    """The model's seven sections, or None if anything about them is unusable."""
    try:
        response = await get_client().messages.create(
            model=model_name(),
            max_tokens=MAX_TOKENS,
            system=prompts.system_blocks(req.chart, req.birth, req.language),
            messages=[{"role": "user", "content": prompts.USER_PROMPT}],
            thinking=THINKING,
            output_config=OUTPUT_CONFIG,
        )
    except APIError as exc:
        logger.warning("report generation fell back to the rule engine: %s", exc)
        return None

    if response.stop_reason == "refusal":
        logger.warning("report generation refused by the model; using rule engine")
        return None

    raw = "".join(
        b.text for b in response.content if getattr(b, "type", None) == "text"
    ).strip()
    return _parse(raw)


def _parse(raw: str) -> list[ReportSection] | None:
    start, end = raw.find("["), raw.rfind("]")
    if start == -1 or end <= start:
        return None
    try:
        parsed = json.loads(raw[start : end + 1])
    except json.JSONDecodeError:
        return None
    if not isinstance(parsed, list) or len(parsed) < MIN_SECTIONS:
        # A three-section report is worse than the deterministic seven.
        return None
    try:
        return [ReportSection(**section) for section in parsed]
    except (ValidationError, TypeError):
        # A malformed section would render as a broken card. The rule engine's
        # output is always well-formed, so prefer it.
        logger.warning("model returned malformed report sections; using rule engine")
        return None
