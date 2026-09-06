"""Disk cache for synthesised audio, keyed by voice + language + text.

Owned by the API, not by the web app. The previous implementation wrote into
`apps/web/public/audio-cache/` and returned a path Next served statically — which
works only while the only client is that Next app, and silently 404s for anyone
else. The file is now served by `GET /v1/tts/audio/{name}`.
"""

from __future__ import annotations

import hashlib
import re
from pathlib import Path

from app.core.config import get_settings

_UNSAFE = re.compile(r"[^A-Za-z0-9]")

# Anchors what a name may contain, so a crafted filename cannot walk out of the
# cache directory and read something else off the disk.
CACHE_NAME = re.compile(r"^[A-Za-z0-9]+_[A-Za-z0-9]+_[0-9a-f]{20}\.mp3$")


def cache_dir() -> Path:
    settings = get_settings()
    path = (
        Path(settings.TTS_CACHE_DIR)
        if settings.TTS_CACHE_DIR
        else Path(__file__).resolve().parents[3] / "data" / "audio-cache"
    )
    path.mkdir(parents=True, exist_ok=True)
    return path


def name_for(voice: str, language: str, text: str) -> str:
    digest = hashlib.sha256(f"{voice}_{language}_{text.strip()}".encode()).hexdigest()[:20]
    return f"{_UNSAFE.sub('', voice)}_{_UNSAFE.sub('', language)}_{digest}.mp3"


def path_for(name: str) -> Path | None:
    """The cached file, or None if the name is not one we could have written."""
    if not CACHE_NAME.match(name):
        return None
    candidate = cache_dir() / name
    # Belt and braces: the regex already forbids separators, but resolving and
    # re-checking the parent means a future change to the regex cannot become a
    # path traversal.
    if candidate.resolve().parent != cache_dir().resolve():
        return None
    return candidate


def read(name: str) -> bytes | None:
    path = path_for(name)
    return path.read_bytes() if path and path.exists() else None


def write(name: str, audio: bytes) -> None:
    path = path_for(name)
    if path is None:
        return
    # Write then rename: a reader must never see a half-written mp3.
    tmp = path.with_suffix(".part")
    tmp.write_bytes(audio)
    tmp.replace(path)
