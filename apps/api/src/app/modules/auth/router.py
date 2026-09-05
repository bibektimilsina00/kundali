"""FastAPI Auth endpoints (signup, login, me)."""

from __future__ import annotations

from datetime import datetime, timezone
import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.core.db import get_db
from app.modules.auth.jwt_handler import (
    create_jwt_token,
    decode_jwt_token,
    hash_password,
    verify_password,
)
from app.modules.auth.schemas import (
    TokenResponse,
    UserLoginIn,
    UserProfileOut,
    UserSignupIn,
)

router = APIRouter(prefix="/v1/auth", tags=["auth"])


def get_current_user(authorization: str | None = Header(None)) -> str:
    """Dependency that extracts and verifies Bearer token, returning user_id."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    token = authorization.split(" ", 1)[1]
    payload = decode_jwt_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return str(payload["sub"])


@router.post("/signup", response_model=TokenResponse)
def signup(body: UserSignupIn) -> TokenResponse:
    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE email = ?", (body.email.lower(),)).fetchone()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )

    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    pw_hash = hash_password(body.password)
    now_iso = datetime.now(timezone.utc).isoformat()

    with conn:
        conn.execute(
            """
            INSERT INTO users (id, email, password_hash, full_name, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, body.email.lower(), pw_hash, body.full_name, now_iso),
        )

    user_out = UserProfileOut(
        id=user_id,
        email=body.email.lower(),
        full_name=body.full_name,
        created_at=now_iso,
    )
    token = create_jwt_token({"sub": user_id, "email": body.email.lower()})
    return TokenResponse(access_token=token, user=user_out)


@router.post("/login", response_model=TokenResponse)
def login(body: UserLoginIn) -> TokenResponse:
    conn = get_db()
    row = conn.execute(
        "SELECT id, email, password_hash, full_name, created_at FROM users WHERE email = ?",
        (body.email.lower(),),
    ).fetchone()

    if not row or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_out = UserProfileOut(
        id=row["id"],
        email=row["email"],
        full_name=row["full_name"],
        created_at=row["created_at"],
    )
    token = create_jwt_token({"sub": row["id"], "email": row["email"]})
    return TokenResponse(access_token=token, user=user_out)


@router.get("/me", response_model=UserProfileOut)
def me(user_id: str = Depends(get_current_user)) -> UserProfileOut:
    conn = get_db()
    row = conn.execute(
        "SELECT id, email, full_name, created_at FROM users WHERE id = ?",
        (user_id,),
    ).fetchone()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserProfileOut(
        id=row["id"],
        email=row["email"],
        full_name=row["full_name"],
        created_at=row["created_at"],
    )
