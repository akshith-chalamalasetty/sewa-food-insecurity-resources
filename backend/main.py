import os
import secrets
from typing import List, Optional
import httpx
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
import models, schemas, auth, seed
import ollama_client

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sewa Food Resources API", version="0.2.0")

# In production, set FRONTEND_ORIGIN to your Netlify URL
# (e.g. https://sewa-food.netlify.app) so the browser is allowed to call this API.
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN] if FRONTEND_ORIGIN else [],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|\[::1\]):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _migrate():
    """Additive SQLite migrations for columns added after the table existed."""
    from sqlalchemy import text
    stmts = [
        "ALTER TABLE donors ADD COLUMN status VARCHAR DEFAULT 'open'",
        "ALTER TABLE donors ADD COLUMN claimed_by_user_id INTEGER",
    ]
    with engine.connect() as conn:
        for s in stmts:
            try:
                conn.execute(text(s))
                conn.commit()
            except Exception:
                pass  # column already exists


@app.on_event("startup")
def _seed():
    _migrate()
    seed.run()


# ============================== Auth ==============================
@app.post("/auth/register", response_model=schemas.Token)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(400, "Email already registered")
    user = models.User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=auth.hash_password(payload.password),
        zip_code=payload.zip_code,
        preferred_language=payload.preferred_language,
    )
    db.add(user); db.commit(); db.refresh(user)
    token = auth.create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.post("/auth/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not auth.verify_password(payload.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password")
    token = auth.create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.get("/auth/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(auth.require_user)):
    return user


# Optional: set GOOGLE_CLIENT_ID to also verify the token was issued for THIS app.
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")


@app.post("/auth/google", response_model=schemas.Token)
async def google_login(payload: schemas.GoogleLogin, db: Session = Depends(get_db)):
    # Verify the ID token with Google.
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": payload.credential},
        )
    if r.status_code != 200:
        raise HTTPException(401, "Invalid Google token")
    info = r.json()

    if GOOGLE_CLIENT_ID and info.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(401, "Google token was issued for a different app")

    email = info.get("email")
    if not email or info.get("email_verified") not in ("true", True):
        raise HTTPException(401, "Google account email is not verified")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        # First Google sign-in: create the account with an unguessable password
        # (they'll always log in via Google; password login stays possible only
        # if they later reset it).
        user = models.User(
            email=email,
            full_name=info.get("name") or email.split("@")[0],
            hashed_password=auth.hash_password(secrets.token_urlsafe(32)),
        )
        db.add(user); db.commit(); db.refresh(user)

    token = auth.create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.post("/auth/intake", response_model=schemas.UserOut)
def save_intake(
    payload: schemas.IntakeSave,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.require_user),
):
    user.situation_tags = ",".join(payload.situation_tags)
    if payload.household_size is not None:
        user.household_size = payload.household_size
    if payload.zip_code:
        user.zip_code = payload.zip_code
    db.commit(); db.refresh(user)
    return user


# ============================== Pantries ==============================
@app.get("/pantries", response_model=List[schemas.PantryOut])
def list_pantries(
    zip: Optional[str] = None,
    no_eligibility_only: bool = False,
    no_id_only: bool = False,
    immigration_safe_only: bool = False,
    db: Session = Depends(get_db),
):
    q = db.query(models.Pantry)
    if zip:
        prefix = zip[:3]
        q = q.filter((models.Pantry.zip_code == zip) | (models.Pantry.zip_code.like(f"{prefix}%")))
    if no_eligibility_only:
        q = q.filter(models.Pantry.requires_eligibility == False)  # noqa: E712
    if no_id_only:
        q = q.filter(models.Pantry.no_id_required == True)  # noqa: E712
    if immigration_safe_only:
        q = q.filter(models.Pantry.immigration_safe == True)  # noqa: E712
    return q.all()


# ============================== Resources ==============================
@app.get("/resources", response_model=List[schemas.ResourceOut])
def list_resources(
    category: Optional[str] = None,
    tag: Optional[str] = None,
    zip: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.Resource)
    if category:
        q = q.filter(models.Resource.category == category)
    if zip:
        prefix = zip[:3]
        q = q.filter(
            (models.Resource.zip_code == zip)
            | (models.Resource.zip_code.like(f"{prefix}%"))
            | (models.Resource.zip_code.is_(None))
        )
    results = q.all()
    if tag:
        results = [r for r in results if tag in (r.tags or "")]
    return results


@app.post("/intake/recommend", response_model=List[schemas.ResourceOut])
def recommend(payload: schemas.IntakeSave, db: Session = Depends(get_db)):
    """Given situation tags, return matched resources ranked by tag overlap."""
    all_res = db.query(models.Resource).all()
    user_tags = set(payload.situation_tags)

    def score(r):
        rt = set((r.tags or "").split(","))
        return len(user_tags & rt)

    ranked = sorted(all_res, key=score, reverse=True)
    matched = [r for r in ranked if score(r) > 0]
    if not matched:
        matched = [r for r in all_res if r.category in ("hotline", "community_fridge")]
    return matched[:20]


# ============================== Food recovery ==============================
@app.get("/food-listings", response_model=List[schemas.FoodListingOut])
def list_food(zip: Optional[str] = None, db: Session = Depends(get_db)):
    # Claimed listings stay visible with a badge (same behavior as donors).
    q = db.query(models.FoodListing)
    if zip:
        q = q.filter(models.FoodListing.zip_code == zip)
    return q.order_by(models.FoodListing.created_at.desc()).all()


@app.post("/food-listings", response_model=schemas.FoodListingOut)
def create_food(
    payload: schemas.FoodListingCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.require_user),
):
    listing = models.FoodListing(**payload.model_dump())
    db.add(listing); db.commit(); db.refresh(listing)
    return listing


@app.post("/food-listings/{listing_id}/claim", response_model=schemas.FoodListingOut)
def claim_food(
    listing_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.require_user),
):
    listing = db.query(models.FoodListing).get(listing_id)
    if not listing:
        raise HTTPException(404, "Listing not found")
    if listing.status != "open":
        raise HTTPException(400, "Listing is no longer open")
    listing.status = "claimed"
    listing.claimed_by_user_id = user.id
    db.commit(); db.refresh(listing)
    return listing


# ============================== Volunteers ==============================
@app.get("/volunteers", response_model=List[schemas.VolunteerOut])
def list_volunteers(
    zip: Optional[str] = None,
    language: Optional[str] = None,
    db: Session = Depends(get_db),
):
    results = db.query(models.Volunteer).all()
    if zip:
        results = [v for v in results if v.service_zips and zip in v.service_zips]
    if language:
        needle = language.strip().lower()
        results = [v for v in results if needle in (v.languages or "").lower()]
    return results


@app.post("/volunteers", response_model=schemas.VolunteerOut)
def register_volunteer(
    payload: schemas.VolunteerCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.require_user),
):
    # Real self-signup: name and fallback contact come from the account.
    vol = models.Volunteer(
        name=user.full_name,
        role="volunteer",
        phone=payload.phone,
        email=user.email,
        service_zips=payload.service_zips,
        languages=payload.languages or "en",
        notes=payload.notes,
    )
    db.add(vol); db.commit(); db.refresh(vol)
    return vol


# ============================== Donors ==============================
@app.get("/donors", response_model=List[schemas.DonorOut])
def list_donors(db: Session = Depends(get_db)):
    return db.query(models.Donor).order_by(models.Donor.created_at.desc()).all()


@app.post("/donors", response_model=schemas.DonorOut)
def register_donor(
    payload: schemas.DonorCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.require_user),
):
    # Name always comes from the logged-in account, not the form.
    donor = models.Donor(
        name=user.full_name,
        donation_type=payload.donation_type,
        contact=payload.contact or user.email,
        notes=payload.notes,
    )
    db.add(donor); db.commit(); db.refresh(donor)
    return donor


@app.post("/donors/{donor_id}/claim", response_model=schemas.DonorOut)
def claim_donor(
    donor_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.require_user),
):
    donor = db.query(models.Donor).get(donor_id)
    if not donor:
        raise HTTPException(404, "Donor offer not found")
    if donor.status != "open":
        raise HTTPException(400, "This offer was already claimed")
    donor.status = "claimed"
    donor.claimed_by_user_id = user.id
    db.commit(); db.refresh(donor)
    return donor


# ============================== Donations ==============================
@app.post("/donations", response_model=schemas.DonationOut)
def make_donation(payload: schemas.DonationCreate, db: Session = Depends(get_db)):
    if payload.amount_usd <= 0:
        raise HTTPException(400, "Amount must be positive")
    donation = models.Donation(
        donor_name=payload.donor_name,
        email=payload.email,
        amount_usd=payload.amount_usd,
        method=payload.method,
        status="succeeded",
    )
    db.add(donation); db.commit(); db.refresh(donation)
    return donation


# ============================== Meal planner ==============================
@app.get("/meal-plans", response_model=List[schemas.MealPlanOut])
def list_meal_plans(
    max_budget: Optional[float] = None,
    diet: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.MealPlan)
    if max_budget is not None:
        q = q.filter(models.MealPlan.weekly_budget_usd <= max_budget)
    if diet and diet != "any":
        q = q.filter(models.MealPlan.diet == diet)
    return q.order_by(models.MealPlan.weekly_budget_usd).all()


# ============================== Chatbot ==============================
def _rule_based(payload: schemas.ChatMessage) -> schemas.ChatReply:
    msg = payload.message.lower()
    es = payload.language == "es"
    def t(en, sp): return sp if es else en

    if any(k in msg for k in ["pantry", "pantries", "despensa", "comida gratis"]):
        return schemas.ChatReply(
            reply=t("Open the Pantries tab and enter your ZIP. Most listed pantries need no ID and ask no immigration questions.",
                    "Abre la pestaña Despensas e ingresa tu código postal. La mayoría no piden identificación ni preguntas de inmigración."),
            suggestions=[t("I'm not eligible for SNAP", "No califico para SNAP"),
                         t("Show community fridges", "Mostrar refrigeradores comunitarios")],
            source="rule-based",
        )
    if "snap" in msg or "calfresh" in msg or "ineligible" in msg or "not eligible" in msg or "denied" in msg:
        return schemas.ChatReply(
            reply=t("Even without SNAP/CalFresh, you have options: food pantries (no ID), community fridges (24/7, anonymous), WIC if you have kids under 5, school meals, and mutual-aid groups. Click 'Get Help' for a tailored list.",
                    "Aunque no califiques para SNAP/CalFresh, tienes opciones: despensas (sin ID), refrigeradores comunitarios (24/7, anónimos), WIC para hijos menores de 5, comidas escolares y grupos de ayuda mutua. Haz clic en 'Obtener Ayuda' para una lista personalizada."),
            suggestions=[t("Take the Get Help quiz", "Hacer el cuestionario"),
                         t("I'm undocumented", "Soy indocumentado/a")],
            source="rule-based",
        )
    if "undocument" in msg or "indocument" in msg or "ice" in msg or "papers" in msg:
        return schemas.ChatReply(
            reply=t("You're safe at the resources listed here. Food pantries are private spaces — ICE cannot enter without a judicial warrant. Most ask no immigration questions. Public charge does NOT apply to food banks, WIC, school meals, or most state programs.",
                    "Estás seguro/a en los recursos listados aquí. Las despensas son espacios privados — ICE no puede entrar sin orden judicial. La mayoría no hacen preguntas sobre inmigración. La 'carga pública' NO aplica a despensas, WIC, ni comidas escolares."),
            suggestions=[t("Know Your Rights", "Conoce tus derechos"),
                         t("Show immigrant-friendly orgs", "Mostrar organizaciones para inmigrantes")],
            source="rule-based",
        )
    if "donate" in msg or "donar" in msg or "donation" in msg:
        return schemas.ChatReply(
            reply=t("Thank you! Open the Donate tab to give food or cash. 100% of cash donations go to food and pickup costs.",
                    "¡Gracias! Abre la pestaña Donar. El 100% va a comida y costos de recogida."),
            suggestions=[t("Go to Donate", "Ir a Donar")],
            source="rule-based",
        )
    if "budget" in msg or "meal" in msg or "recipe" in msg or "presupuesto" in msg:
        return schemas.ChatReply(
            reply=t("The Meal Planner tab has $15, $25, and $60 weekly plans, including one for folks without a kitchen.",
                    "El Planificador de Comidas tiene planes semanales de $15, $25 y $60, incluyendo uno sin cocina."),
            suggestions=[t("Open Meal Planner", "Abrir Planificador")],
            source="rule-based",
        )
    return schemas.ChatReply(
        reply=t("Hi! I can help you find food pantries, community fridges, WIC, school meals, mutual aid, and immigrant-friendly orgs. What's going on?",
                "¡Hola! Puedo ayudarte a encontrar despensas, refrigeradores comunitarios, WIC, comidas escolares, ayuda mutua y organizaciones para inmigrantes. ¿Qué necesitas?"),
        suggestions=[
            t("I'm not eligible for SNAP", "No califico para SNAP"),
            t("I'm undocumented", "Soy indocumentado/a"),
            t("I have kids", "Tengo hijos"),
            t("I'm a student", "Soy estudiante"),
        ],
        source="rule-based",
    )


@app.post("/chat", response_model=schemas.ChatReply)
async def chat(payload: schemas.ChatMessage):
    """Try Ollama first; fall back to rule-based if Ollama is unavailable."""
    try:
        reply = await ollama_client.chat(payload.message, payload.history, payload.language)
        return schemas.ChatReply(reply=reply, suggestions=[], source="ollama")
    except Exception:
        return _rule_based(payload)


@app.get("/chat/status")
async def chat_status():
    import httpx
    try:
        async with httpx.AsyncClient(timeout=2.0) as c:
            r = await c.get(f"{ollama_client.OLLAMA_URL}/api/tags")
            return {"ollama_online": r.status_code == 200, "model": ollama_client.OLLAMA_MODEL}
    except Exception:
        return {"ollama_online": False, "model": ollama_client.OLLAMA_MODEL}
