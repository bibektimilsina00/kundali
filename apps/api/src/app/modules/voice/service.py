"""Voice business logic: synthesis, transcription, realtime session minting.

OpenAI-specific. TTS, Whisper and the Realtime API have no AgentRouter
equivalent, so this module talks to OpenAI directly rather than through
`integrations/llm.py`, which is the Anthropic-wire client.
"""

from __future__ import annotations

import logging

import httpx

from app.core.config import get_settings
from app.core.errors import AppError
from app.modules.voice import cache, prompts
from app.modules.voice.schemas import (
    RealtimeSessionRequest,
    RealtimeSessionResponse,
    SpeakRequest,
    SpeakResponse,
    TranscriptResponse,
)
from app.modules.voice.text_processor import split_into_chunks, to_spoken

logger = logging.getLogger(__name__)

OPENAI_BASE = "https://api.openai.com/v1"
TTS_MODEL = "tts-1"
TRANSCRIBE_MODEL = "whisper-1"
TIMEOUT = httpx.Timeout(30.0, connect=10.0)

# Tried in order; the first the account has access to wins.
REALTIME_MODELS = (
    "gpt-4o-mini-realtime-preview-2024-12-17",
    "gpt-4o-realtime-preview-2024-12-17",
    "gpt-4o-realtime-preview",
    "gpt-4o-mini-realtime-preview",
)

_TTS_LANGUAGE_CODES = {"ne": "ne-NP", "hi": "hi-IN", "en": "en-US"}


class VoiceUnavailableError(AppError):
    status_code = 503
    code = "voice_unavailable"


def _api_key() -> str | None:
    return get_settings().OPENAI_API_KEY or None


# --- Speech synthesis ---


async def speak(req: SpeakRequest) -> SpeakResponse:
    spoken = to_spoken(req.text)
    if not spoken:
        raise VoiceUnavailableError("There is nothing to read aloud.")

    language_code = _TTS_LANGUAGE_CODES.get(req.language, "en-US")
    name = cache.name_for(req.voice, language_code, spoken)

    if cache.read(name) is not None:
        return SpeakResponse(
            audio_url=audio_url(name),
            spoken_text=spoken,
            cached=True,
            source=f"disk_cache_{req.voice}",
        )

    audio = await _openai_speech(spoken, req.voice)
    source = f"openai_tts_{req.voice}"
    if audio is None:
        audio = await _fallback_speech(spoken, language_code)
        source = "google_tts_fallback"

    if not audio:
        raise VoiceUnavailableError("Could not synthesise audio right now.")

    cache.write(name, audio)
    return SpeakResponse(
        audio_url=audio_url(name), spoken_text=spoken, cached=False, source=source
    )


def audio_url(name: str) -> str:
    return f"/v1/tts/audio/{name}"


async def _openai_speech(text: str, voice: str) -> bytes | None:
    key = _api_key()
    if not key:
        return None
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            res = await client.post(
                f"{OPENAI_BASE}/audio/speech",
                headers={"Authorization": f"Bearer {key}"},
                json={
                    "model": TTS_MODEL,
                    # The API caps input length; truncating beats a 400 that
                    # leaves the user with no audio at all.
                    "input": text[:4000],
                    "voice": voice,
                    "speed": 1.0,
                },
            )
        if res.status_code == 200:
            return res.content
        logger.warning("openai tts returned %s; falling back", res.status_code)
    except httpx.HTTPError as exc:
        logger.warning("openai tts failed (%s); falling back", exc)
    return None


async def _fallback_speech(text: str, language_code: str) -> bytes:
    """Free engine, one request per sentence chunk, concatenated.

    Its query string is length-limited, which is why `split_into_chunks` splits
    on sentence boundaries rather than slicing.
    """
    chunks = split_into_chunks(text)
    audio = b""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        for chunk in chunks:
            res = await client.get(
                "https://translate.google.com/translate_tts",
                params={"ie": "UTF-8", "q": chunk, "tl": language_code, "client": "tw-ob"},
                headers={"User-Agent": "Mozilla/5.0"},
            )
            if res.status_code != 200:
                logger.warning("fallback tts chunk failed: %s", res.status_code)
                break
            audio += res.content
    return audio


# --- Transcription ---


async def transcribe(audio: bytes, filename: str, language: str | None) -> TranscriptResponse:
    key = _api_key()
    if not key:
        raise VoiceUnavailableError("Speech recognition is not configured.")

    data = {"model": TRANSCRIBE_MODEL}
    if language:
        data["language"] = language

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            res = await client.post(
                f"{OPENAI_BASE}/audio/transcriptions",
                headers={"Authorization": f"Bearer {key}"},
                files={"file": (filename, audio, "audio/webm")},
                data=data,
            )
    except httpx.HTTPError as exc:
        logger.warning("transcription failed: %s", exc)
        raise VoiceUnavailableError("Could not transcribe that audio.") from exc

    if res.status_code != 200:
        logger.warning("transcription returned %s", res.status_code)
        raise VoiceUnavailableError("Could not transcribe that audio.")

    return TranscriptResponse(text=res.json().get("text", ""))


# --- Realtime session ---


async def create_realtime_session(req: RealtimeSessionRequest) -> RealtimeSessionResponse:
    """Mint an ephemeral key for the browser's WebRTC connection.

    The key is short-lived and scoped to one session, which is the entire reason
    this endpoint exists: the account key must never reach a browser.
    """
    instructions = prompts.build_realtime_prompt(req.chart, req.birth, req.language)
    key = _api_key()
    if not key:
        # Instructions are returned either way: the client shows them in its
        # debug panel, and a special case that omits them is a second shape to
        # handle for no benefit.
        return RealtimeSessionResponse(
            fallback="media_recorder_whisper", instructions=instructions
        )

    payload = {
        "voice": req.voice,
        "instructions": instructions,
        "input_audio_transcription": {"model": TRANSCRIBE_MODEL},
        "turn_detection": {
            "type": "server_vad",
            "threshold": 0.5,
            "prefix_padding_ms": 300,
            "silence_duration_ms": 600,
        },
    }

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        for model in REALTIME_MODELS:
            try:
                res = await client.post(
                    f"{OPENAI_BASE}/realtime/sessions",
                    headers={
                        "Authorization": f"Bearer {key}",
                        "OpenAI-Beta": "realtime=v1",
                    },
                    json={"model": model, **payload},
                )
            except httpx.HTTPError as exc:
                logger.warning("realtime session request failed for %s: %s", model, exc)
                continue

            if res.status_code == 200:
                secret = (res.json().get("client_secret") or {}).get("value")
                if secret:
                    return RealtimeSessionResponse(
                        client_secret=secret, model=model, instructions=instructions
                    )

    # Not an error: the client has a working path without a live session, and
    # the Realtime API is simply not on every account tier.
    logger.info("realtime unavailable on all candidate models; client will fall back")
    return RealtimeSessionResponse(
        fallback="media_recorder_whisper", instructions=instructions
    )
