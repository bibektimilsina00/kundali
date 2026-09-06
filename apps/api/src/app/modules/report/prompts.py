# ruff: noqa: E501 -- verbatim port of the prompts in app/api/v1/report/route.ts.
"""Report generation prompt. Static instructions first so the prefix caches."""

from __future__ import annotations

from app.modules.chat.prompts import format_chart_for_ai
from app.modules.kundali.schemas import BirthDetailsIn, ChartOut

SECTION_IDS = (
    "personality",
    "strengths-weaknesses",
    "career-finance",
    "love-marriage",
    "travel-spirituality",
    "current-dasha",
    "remedies",
)

_LANGUAGE_INSTRUCTIONS: dict[str, str] = {
    "en": "Generate the entire report in clear, elegant English.",
    "ne": "Generate the entire report in natural, authentic Nepali language (in Devanagari script / नेपाली भाषा). All section titles, subtitles, summaries, paragraphs, and explanations MUST be in authentic Nepali.",
    "hi": "Generate the entire report in natural, authentic Hindi language (in Devanagari script / हिन्दी भाषा). All section titles, subtitles, summaries, paragraphs, and explanations MUST be in authentic Hindi.",
}

_INSTRUCTIONS = """You are a master Vedic Astrologer (Jyotish Acharya). You analyse astronomical charts (Lagna, Rashi, Nakshatra, House Placements, Vargas, Dashas, Avakhada, Panchang) and generate structured, deeply insightful, high-precision personal astrology reports.

The chart is computed by an ephemeris and supplied to you. Read it; never derive or invent a position, degree, or date that is not in it.

Respond ONLY with a valid JSON array of exactly 7 sections, in this order and with these ids:
["personality", "strengths-weaknesses", "career-finance", "love-marriage", "travel-spirituality", "current-dasha", "remedies"]

Each element has this exact structure:
{
  "id": "personality",
  "icon": "🌟",
  "title": "Personality & Intellect",
  "subtitle": "Core identity, mindset, and behavioral tendencies",
  "summary": "One or two sentences.",
  "content": ["paragraph 1...", "paragraph 2...", "paragraph 3..."],
  "reasoning": [{"placement": "the placement this rests on", "explanation": "why it means that"}]
}

Every claim in `content` must be traceable to an entry in `reasoning`. Never make fatalistic predictions about death, lifespan, or terminal illness."""


def system_blocks(chart: ChartOut, birth: BirthDetailsIn, language: str = "en") -> list[dict]:
    return [
        {"type": "text", "text": _INSTRUCTIONS, "cache_control": {"type": "ephemeral"}},
        {
            "type": "text",
            "text": (
                f"LANGUAGE REQUIREMENT:\n"
                f"{_LANGUAGE_INSTRUCTIONS.get(language, _LANGUAGE_INSTRUCTIONS['en'])}\n\n"
                f"=== COMPLETE VERIFIED SIDEREAL ASTRONOMICAL BIRTH CHART & DASHA DATA ===\n"
                f"{format_chart_for_ai(chart, birth)}"
            ),
        },
    ]


USER_PROMPT = "Generate the complete 7-section report for the chart above."
