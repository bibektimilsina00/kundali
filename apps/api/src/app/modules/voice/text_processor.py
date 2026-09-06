"""Turn markdown into something worth speaking. Ported from the TTS route.

Read aloud, `**Saturn**` becomes "asterisk asterisk Saturn" and `27°` becomes
"twenty-seven" with the unit dropped — so the astrology is silently lost. This
module exists to prevent that, and its behaviour is pinned by tests.
"""

from __future__ import annotations

import re

# Longest form first: "27°30" must become degrees *and* minutes before the bare
# degree rule can consume the symbol on its own.
_DEGREES_MINUTES = re.compile(r"(\d+)°(\d+)")
_DEGREES = re.compile(r"(\d+)°")
_CODE_BLOCK = re.compile(r"```.*?```", re.DOTALL)
# Collapses runs, not just newlines: the substitutions above leave double
# spaces ("27° exactly" -> "27 degrees  exactly"). Harmless to a synthesiser,
# but `spoken_text` is shown as a teleprompter, where it reads as a typo.
_WHITESPACE = re.compile(r"\s+")
_SENTENCE = re.compile(r"[^.!?]+[.!?]+")

MAX_CHUNK_CHARS = 170


def to_spoken(text: str) -> str:
    """Markdown and symbols to words."""
    out = _CODE_BLOCK.sub(" ", text)
    out = out.replace("**", "").replace("*", "").replace("#", "")
    out = _DEGREES_MINUTES.sub(r"\1 degrees \2 minutes", out)
    out = _DEGREES.sub(r"\1 degrees ", out)
    out = out.replace("°", " degrees ").replace("%", " percent ")
    out = _WHITESPACE.sub(" ", out)
    return out.strip()


def split_into_chunks(text: str, max_len: int = MAX_CHUNK_CHARS) -> list[str]:
    """Split on sentence boundaries, never mid-word.

    The fallback engine takes a length-limited query string, and a chunk cut in
    the middle of a word is audibly wrong.
    """
    clean = to_spoken(text)
    if len(clean) <= max_len:
        return [clean] if clean else []

    sentences = _SENTENCE.findall(clean) or [clean]
    chunks: list[str] = []
    current = ""
    for sentence in sentences:
        if len(current) + len(sentence) + 1 > max_len:
            if current:
                chunks.append(current.strip())
            current = sentence
        else:
            current = f"{current} {sentence}" if current else sentence
    if current.strip():
        chunks.append(current.strip())

    # A single sentence longer than the limit would otherwise be dropped.
    return [c for c in chunks if c] or [clean[:max_len]]
