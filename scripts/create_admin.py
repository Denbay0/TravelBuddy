"""Create or promote an admin user.

Usage:
  python scripts/create_admin.py --email admin@example.com --password 'StrongPass1234' --username admin
"""

import argparse

from sqlalchemy import select

from app.core.security import hash_password
from app.db.database import SessionLocal, create_tables
from app.db.models import User
from app.utils_profile import generate_unique_handle


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create TravelBuddy admin user")
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--username", default="admin")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    email = args.email.strip().lower()
    username = args.username.strip()

    create_tables()
    db = SessionLocal()

    try:
        existing = db.scalar(select(User).where(User.email == email))
        if existing:
            existing.is_admin = True
            existing.password_hash = hash_password(args.password)
            db.add(existing)
            db.commit()
            print(f"Updated existing user '{email}' and granted admin access.")
            return

        admin = User(
            username=username,
            email=email,
            handle=generate_unique_handle(db, username),
            password_hash=hash_password(args.password),
            is_admin=True,
        )
        db.add(admin)
        db.commit()
        print(f"Created admin user '{email}'.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
