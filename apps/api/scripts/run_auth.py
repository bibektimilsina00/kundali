import sys
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from datetime import datetime, timezone
import uuid

from app.core.db import get_db
from app.modules.auth.jwt_handler import (
    create_jwt_token,
    decode_jwt_token,
    hash_password,
    verify_password,
)

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing action or payload"}))
        sys.exit(1)

    action = sys.argv[1]
    payload = json.loads(sys.argv[2])
    token_header = sys.argv[3] if len(sys.argv) > 3 else None

    conn = get_db()

    if action == "signup":
        email = payload.get("email", "").lower()
        password = payload.get("password", "")
        full_name = payload.get("full_name", "")

        cursor = conn.cursor()
        existing = cursor.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if existing:
            print(json.dumps({"status": 400, "detail": "Email is already registered"}))
            return

        user_id = f"usr_{uuid.uuid4().hex[:12]}"
        pw_hash = hash_password(password)
        now_iso = datetime.now(timezone.utc).isoformat()

        with conn:
            conn.execute(
                """
                INSERT INTO users (id, email, password_hash, full_name, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (user_id, email, pw_hash, full_name, now_iso),
            )

        token = create_jwt_token({"sub": user_id, "email": email})
        user_out = {
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "created_at": now_iso,
        }
        print(json.dumps({"status": 200, "access_token": token, "user": user_out}))
        return

    elif action == "login":
        email = payload.get("email", "").lower()
        password = payload.get("password", "")

        row = conn.execute(
            "SELECT id, email, password_hash, full_name, created_at FROM users WHERE email = ?",
            (email,),
        ).fetchone()

        if not row or not verify_password(password, row["password_hash"]):
            print(json.dumps({"status": 401, "detail": "Invalid email or password"}))
            return

        token = create_jwt_token({"sub": row["id"], "email": row["email"]})
        user_out = {
            "id": row["id"],
            "email": row["email"],
            "full_name": row["full_name"],
            "created_at": row["created_at"],
        }
        print(json.dumps({"status": 200, "access_token": token, "user": user_out}))
        return

    elif action == "me":
        if not token_header or not token_header.startswith("Bearer "):
            print(json.dumps({"status": 401, "detail": "Unauthorized"}))
            return
        token_str = token_header.split(" ", 1)[1]
        decoded = decode_jwt_token(token_str)
        if not decoded or "sub" not in decoded:
            print(json.dumps({"status": 401, "detail": "Invalid token"}))
            return

        user_id = str(decoded["sub"])
        row = conn.execute(
            "SELECT id, email, full_name, created_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

        if not row:
            print(json.dumps({"status": 404, "detail": "User not found"}))
            return

        print(json.dumps({"status": 200, "id": row["id"], "email": row["email"], "full_name": row["full_name"], "created_at": row["created_at"]}))
        return

    elif action == "list_kundalis":
        if not token_header or not token_header.startswith("Bearer "):
            print(json.dumps({"status": 401, "detail": "Unauthorized"}))
            return
        token_str = token_header.split(" ", 1)[1]
        decoded = decode_jwt_token(token_str)
        if not decoded or "sub" not in decoded:
            print(json.dumps([]))
            return
        user_id = str(decoded["sub"])
        rows = conn.execute(
            "SELECT id, user_id, name, gender, dob, tob, lat, lon, tz_offset, place_name, created_at FROM saved_kundalis WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        ).fetchall()
        print(json.dumps([dict(r) for r in rows]))
        return

    elif action == "save_kundali":
        if not token_header or not token_header.startswith("Bearer "):
            print(json.dumps({"status": 401, "detail": "Unauthorized"}))
            return
        token_str = token_header.split(" ", 1)[1]
        decoded = decode_jwt_token(token_str)
        if not decoded or "sub" not in decoded:
            print(json.dumps({"status": 401, "detail": "Invalid token"}))
            return
        user_id = str(decoded["sub"])
        kundali_id = f"knd_{uuid.uuid4().hex[:12]}"
        now_iso = datetime.now(timezone.utc).isoformat()
        with conn:
            conn.execute(
                """
                INSERT INTO saved_kundalis (id, user_id, name, gender, dob, tob, lat, lon, tz_offset, place_name, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    kundali_id,
                    user_id,
                    payload["name"],
                    payload.get("gender", "male"),
                    payload["dob"],
                    payload["tob"],
                    payload["lat"],
                    payload["lon"],
                    payload["tz_offset"],
                    payload["place_name"],
                    now_iso,
                ),
            )
        print(json.dumps({
            "id": kundali_id,
            "user_id": user_id,
            "name": payload["name"],
            "gender": payload.get("gender", "male"),
            "dob": payload["dob"],
            "tob": payload["tob"],
            "lat": payload["lat"],
            "lon": payload["lon"],
            "tz_offset": payload["tz_offset"],
            "place_name": payload["place_name"],
            "created_at": now_iso,
        }))
        return

    print(json.dumps({"error": f"Unknown action {action}"}))

if __name__ == "__main__":
    main()
