"""211 LA County API integration.

Apply for a partner API key at:
    https://www.211la.org/partner-with-us

Once you have a key, set the env var before running uvicorn:
    $env:TWO_ONE_ONE_API_KEY = "your-key-here"

Then run:
    python refresh_data.py 211

This fetches food pantries in LA County and upserts them into your DB.

NOTE: the exact endpoint shape depends on which 211 LA API tier you get
(some partners use iCarol, others use a custom REST API). The function below
is a template — you'll likely need to adjust the URL and the field mapping
based on what your API key gives access to. Comments mark what's likely.
"""
import os
import httpx
from sqlalchemy.orm import Session

API_KEY = os.getenv("TWO_ONE_ONE_API_KEY", "")
# Most 211 LA partners get an iCarol-based endpoint. Adjust to whatever the
# partner email tells you.
BASE_URL = os.getenv("TWO_ONE_ONE_BASE", "https://api.211la.org/v1")


async def fetch_food_pantries(zip_filter: str | None = None) -> list[dict]:
    """Returns a list of normalized pantry dicts ready for DB insert."""
    if not API_KEY:
        raise RuntimeError(
            "No 211 LA API key set. Apply at https://www.211la.org/partner-with-us "
            "then set $env:TWO_ONE_ONE_API_KEY before running."
        )

    params = {
        "category": "food-pantries",
        "limit": 500,
    }
    if zip_filter:
        params["zip"] = zip_filter

    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(
            f"{BASE_URL}/services/search",
            params=params,
            headers={"Authorization": f"Bearer {API_KEY}"},
        )
        r.raise_for_status()
        data = r.json()

    # Adjust these field names to match whatever your API key actually returns.
    # Common 211/iCarol fields are: agency_name, site_name, address1, city,
    # zip, phone, hours, languages, latitude, longitude.
    results = []
    for item in data.get("results", []):
        results.append({
            "name": item.get("site_name") or item.get("agency_name", ""),
            "address": item.get("address1", ""),
            "city": item.get("city", ""),
            "zip_code": str(item.get("zip", "")),
            "phone": item.get("phone"),
            "hours": item.get("hours"),
            "languages": ",".join(item.get("languages", ["en"])),
            "lat": item.get("latitude"),
            "lng": item.get("longitude"),
            "notes": item.get("eligibility_notes"),
            # Pantries from 211 LA generally don't require SNAP eligibility,
            # but you should verify per-record before trusting these defaults.
            "requires_eligibility": bool(item.get("requires_eligibility", False)),
            "no_id_required": True,
            "immigration_safe": True,
        })
    return results


async def upsert_to_db(db: Session, pantries: list[dict]) -> int:
    """Insert/update pantries by (name + address). Returns number written."""
    from models import Pantry
    n = 0
    for p in pantries:
        existing = (
            db.query(Pantry)
            .filter(Pantry.name == p["name"], Pantry.address == p["address"])
            .first()
        )
        if existing:
            for k, v in p.items():
                setattr(existing, k, v)
        else:
            db.add(Pantry(**p))
        n += 1
    db.commit()
    return n
