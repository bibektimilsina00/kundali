"""Data access for the users table. No business logic, no HTTP concepts.

The session is passed in rather than fetched from a global: that is the whole of
the dependency inversion this layer needs, and it is what lets a service be
tested against an in-memory database with no app running.
"""

from __future__ import annotations

from sqlmodel import Session, select

from app.modules.auth.models import User


def find_by_email(session: Session, email: str) -> User | None:
    return session.exec(select(User).where(User.email == email.lower())).first()


def find_by_id(session: Session, user_id: str) -> User | None:
    return session.get(User, user_id)


def create(
    session: Session,
    user_id: str,
    email: str,
    password_hash: str,
    full_name: str,
    created_at: str,
) -> User:
    user = User(
        id=user_id,
        email=email.lower(),
        password_hash=password_hash,
        full_name=full_name,
        created_at=created_at,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def update_password_hash(session: Session, user: User, password_hash: str) -> None:
    user.password_hash = password_hash
    session.add(user)
    session.commit()
