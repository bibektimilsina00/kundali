"""FastAPI endpoints for User Cloud Vault (Kundalis & Chat History)."""

from __future__ import annotations

from datetime import datetime, timezone
import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.db import get_db
from app.modules.auth.router import get_current_user
from app.modules.vault.schemas import (
    ChatMessageIn,
    ChatMessageOut,
    ChatSessionIn,
    ChatSessionOut,
    SavedKundaliIn,
    SavedKundaliOut,
)

router = APIRouter(prefix="/v1/vault", tags=["vault"])


@router.get("/kundalis", response_model=list[SavedKundaliOut])
def list_kundalis(user_id: str = Depends(get_current_user)) -> list[SavedKundaliOut]:
    conn = get_db()
    rows = conn.execute(
        """
        SELECT id, user_id, name, gender, dob, tob, lat, lon, tz_offset, place_name, created_at
        FROM saved_kundalis
        WHERE user_id = ?
        ORDER BY created_at DESC
        """,
        (user_id,),
    ).fetchall()

    return [SavedKundaliOut(**dict(r)) for r in rows]


@router.post("/kundalis", response_model=SavedKundaliOut)
def save_kundali(body: SavedKundaliIn, user_id: str = Depends(get_current_user)) -> SavedKundaliOut:
    conn = get_db()
    kundali_id = f"knd_{uuid.uuid4().hex[:12]}"
    now_iso = datetime.now(timezone.utc).isoformat()

    with conn:
        conn.execute(
            """
            INSERT INTO saved_kundalis
            (id, user_id, name, gender, dob, tob, lat, lon, tz_offset, place_name, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                kundali_id,
                user_id,
                body.name,
                body.gender,
                body.dob,
                body.tob,
                body.lat,
                body.lon,
                body.tz_offset,
                body.place_name,
                now_iso,
            ),
        )

    return SavedKundaliOut(
        id=kundali_id,
        user_id=user_id,
        created_at=now_iso,
        **body.model_dump(),
    )


@router.delete("/kundalis/{kundali_id}")
def delete_kundali(kundali_id: str, user_id: str = Depends(get_current_user)) -> dict[str, bool]:
    conn = get_db()
    with conn:
        res = conn.execute(
            "DELETE FROM saved_kundalis WHERE id = ? AND user_id = ?",
            (kundali_id, user_id),
        )
        if res.rowcount == 0:
            raise HTTPException(status_code=404, detail="Kundali not found")
    return {"success": True}


@router.get("/sessions", response_model=list[ChatSessionOut])
def list_sessions(user_id: str = Depends(get_current_user)) -> list[ChatSessionOut]:
    conn = get_db()
    rows = conn.execute(
        """
        SELECT id, user_id, kundali_id, title, created_at, updated_at
        FROM chat_sessions
        WHERE user_id = ?
        ORDER BY updated_at DESC
        """,
        (user_id,),
    ).fetchall()

    res: list[ChatSessionOut] = []
    for r in rows:
        msgs = conn.execute(
            """
            SELECT id, session_id, sender, content, created_at
            FROM chat_messages
            WHERE session_id = ?
            ORDER BY created_at ASC
            """,
            (r["id"],),
        ).fetchall()

        res.append(
            ChatSessionOut(
                id=r["id"],
                user_id=r["user_id"],
                kundali_id=r["kundali_id"],
                title=r["title"],
                created_at=r["created_at"],
                updated_at=r["updated_at"],
                messages=[ChatMessageOut(**dict(m)) for m in msgs],
            )
        )
    return res


@router.post("/sessions", response_model=ChatSessionOut)
def create_session(body: ChatSessionIn, user_id: str = Depends(get_current_user)) -> ChatSessionOut:
    conn = get_db()
    session_id = f"ses_{uuid.uuid4().hex[:12]}"
    now_iso = datetime.now(timezone.utc).isoformat()

    with conn:
        conn.execute(
            """
            INSERT INTO chat_sessions (id, user_id, kundali_id, title, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (session_id, user_id, body.kundali_id, body.title, now_iso, now_iso),
        )

    return ChatSessionOut(
        id=session_id,
        user_id=user_id,
        kundali_id=body.kundali_id,
        title=body.title,
        created_at=now_iso,
        updated_at=now_iso,
        messages=[],
    )


@router.get("/sessions/{session_id}", response_model=ChatSessionOut)
def get_session(session_id: str, user_id: str = Depends(get_current_user)) -> ChatSessionOut:
    conn = get_db()
    row = conn.execute(
        "SELECT id, user_id, kundali_id, title, created_at, updated_at FROM chat_sessions WHERE id = ? AND user_id = ?",
        (session_id, user_id),
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Chat session not found")

    msgs = conn.execute(
        "SELECT id, session_id, sender, content, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC",
        (session_id,),
    ).fetchall()

    return ChatSessionOut(
        id=row["id"],
        user_id=row["user_id"],
        kundali_id=row["kundali_id"],
        title=row["title"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
        messages=[ChatMessageOut(**dict(m)) for m in msgs],
    )


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageOut)
def add_message(
    session_id: str,
    body: ChatMessageIn,
    user_id: str = Depends(get_current_user),
) -> ChatMessageOut:
    conn = get_db()
    row = conn.execute(
        "SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?",
        (session_id, user_id),
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Chat session not found")

    msg_id = f"msg_{uuid.uuid4().hex[:12]}"
    now_iso = datetime.now(timezone.utc).isoformat()

    with conn:
        conn.execute(
            """
            INSERT INTO chat_messages (id, session_id, sender, content, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (msg_id, session_id, body.sender, body.content, now_iso),
        )
        conn.execute(
            "UPDATE chat_sessions SET updated_at = ? WHERE id = ?",
            (now_iso, session_id),
        )

    return ChatMessageOut(
        id=msg_id,
        session_id=session_id,
        sender=body.sender,
        content=body.content,
        created_at=now_iso,
    )


@router.delete("/sessions/{session_id}")
def delete_session(session_id: str, user_id: str = Depends(get_current_user)) -> dict[str, bool]:
    conn = get_db()
    with conn:
        res = conn.execute(
            "DELETE FROM chat_sessions WHERE id = ? AND user_id = ?",
            (session_id, user_id),
        )
        if res.rowcount == 0:
            raise HTTPException(status_code=404, detail="Session not found")
    return {"success": True}
