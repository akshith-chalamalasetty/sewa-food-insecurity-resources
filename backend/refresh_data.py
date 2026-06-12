"""CLI to refresh real pantry data from external sources.

Usage:
    python refresh_data.py 211          # pull from 211 LA (requires API key)
    python refresh_data.py status       # show what's in the DB

Set up the 211 LA API key first:
    $env:TWO_ONE_ONE_API_KEY = "your-key"

Apply for a partner key at https://www.211la.org/partner-with-us
"""
import asyncio
import sys
from database import SessionLocal
from integrations import two_one_one_la


async def refresh_from_211():
    print("Fetching pantries from 211 LA…")
    try:
        pantries = await two_one_one_la.fetch_food_pantries()
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    print(f"  Got {len(pantries)} pantries.")
    db = SessionLocal()
    try:
        n = await two_one_one_la.upsert_to_db(db, pantries)
        print(f"✅ Wrote {n} pantries to the database.")
    finally:
        db.close()


def show_status():
    from models import Pantry, Resource
    db = SessionLocal()
    try:
        print(f"Pantries in DB: {db.query(Pantry).count()}")
        print(f"Resources in DB: {db.query(Resource).count()}")
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    cmd = sys.argv[1].lower()
    if cmd == "211":
        asyncio.run(refresh_from_211())
    elif cmd == "status":
        show_status()
    else:
        print(__doc__)
        sys.exit(1)
