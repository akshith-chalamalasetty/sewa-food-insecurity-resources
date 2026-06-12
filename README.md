# Sewa Food Resources

A food-resources hub for Los Angeles County and the wider SoCal region, focused on people **ineligible for SNAP/CalFresh** — undocumented residents, mixed-status families, recent immigrants, students, seniors, and people just over the income line.

- **Frontend:** React + Vite + React Router
- **Backend:** FastAPI + SQLAlchemy + SQLite (a real SQL database — see "Database" below)
- **Auth:** JWT (email + password, bcrypt hashed)
- **AI:** Local Ollama (any open-source model) with graceful fallback to rule-based chat
- **i18n:** 6 languages — English, Spanish, Chinese, Vietnamese, Korean, Tagalog
- **Maps:** Leaflet + OpenStreetMap (no API key), with browser geolocation
- **Live data:** optional 211 LA County API integration

## Features

### Tailored to SNAP-ineligible communities
- **Get Help wizard** — pick your situation (undocumented, mixed-status, student, senior, recent immigrant, denied SNAP, no kitchen, no address) and get a ranked list of matched resources
- **Resources library** — 25+ curated SoCal entries across 10 categories: community fridges, mutual aid, WIC, school meals, senior programs, student programs, immigrant orgs, legal aid, know-your-rights, hotlines
- **Trust badges** on every card — "No ID needed", "Immigration-safe", language coverage
- **Hero "Is this site for you?" section** on the home page that names the audience directly

### Original feature set (kept)
- Email/password signup and login
- Food pantries searchable by ZIP, with no-eligibility / no-ID / immigration-safe filters
- Food Waste Recovery — businesses post excess, volunteers/nonprofits claim pickups
- Volunteer + SNAP coordinator directory (filter by ZIP and role)
- Donor sign-up and listing
- Budget meal planner ($15, $25, $60/week plans — including one for no-kitchen folks)
- Donation page (Stripe/PayPal not wired — clearly marked as demo)
- Youth programs (LAUSD Grab-and-Go, SFSP, CACFP)

### AI chatbot
- Calls local **Ollama** if running, falls back to rule-based replies otherwise
- Status indicator in the UI shows which mode it's in
- System prompt is tuned for warm, plain-language help for SNAP-ineligible users (see `backend/ollama_client.py`)

## Running locally

### 1. Backend
```powershell
cd "sewa food insecurity project\backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
SQLite DB auto-creates and seeds on first run. API docs: http://127.0.0.1:8000/docs

### 2. Frontend
```powershell
cd "sewa food insecurity project\frontend"
npm install
npm run dev
```
Open http://127.0.0.1:5173

## Setting up the AI chatbot (Ollama)

1. Install Ollama from https://ollama.com (the Windows installer runs it as a background service).
2. Open PowerShell and pull a model. Recommended for hackathon/laptop:
   ```powershell
   ollama pull llama3.2
   ```
   Other good options: `mistral`, `gemma2:2b` (small/fast), `qwen2.5:7b` (high quality).
3. Restart the backend. The chatbot's status badge will switch from 🟡 "Fallback mode" to 🟢 "AI online".

To change the model, set an env var before running uvicorn:
```powershell
$env:OLLAMA_MODEL = "mistral"
uvicorn main:app --reload --port 8000
```

If Ollama isn't running, the chatbot still works — it just uses the rule-based responses.

## Live data (211 LA API)

The seeded pantries are **demo data**. To pull real, current pantries from 211 LA County:

1. Apply for a partner API key at https://www.211la.org/partner-with-us — review takes ~1-2 weeks
2. Once approved, set the key in your backend shell:
   ```powershell
   $env:TWO_ONE_ONE_API_KEY = "your-key-here"
   ```
3. Pull data into your DB:
   ```powershell
   python refresh_data.py 211
   ```

The integration code is in `backend/integrations/two_one_one_la.py`. You'll likely need to adjust the field mapping in there based on which API tier your key gives you — comments explain what to change.

To run this on a schedule, wrap it in a Windows Task Scheduler job or a cron task that calls `python refresh_data.py 211` once a day.

## Database

The current setup uses **SQLite via SQLAlchemy** — that *is* a real SQL database. User accounts, donations, pantries, resources, food listings, intake answers all persist to `backend/food_resources.db`. Passwords are bcrypt-hashed; auth uses JWT tokens.

For deployment you can switch to PostgreSQL or Supabase by changing one line in `backend/database.py`:
```python
SQLALCHEMY_DATABASE_URL = "postgresql://user:pass@host:5432/dbname"
# or Supabase:
SQLALCHEMY_DATABASE_URL = "postgresql://postgres.xxxxx:password@aws-region.pooler.supabase.com:6543/postgres"
```
Then `pip install psycopg2-binary` and restart. No other code changes needed — SQLAlchemy handles the rest.

## Project structure

```
sewa food insecurity project/
├── backend/
│   ├── main.py              # All API routes
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic
│   ├── database.py          # SQLAlchemy setup
│   ├── auth.py              # JWT + bcrypt
│   ├── ollama_client.py     # Ollama HTTP client
│   ├── seed.py              # Sample data
│   └── requirements.txt
├── frontend/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── api.js
│       ├── styles.css
│       ├── context/         # AuthContext, LangContext
│       ├── components/      # NavBar, ResourceCard
│       └── pages/
│           ├── Home.jsx
│           ├── GetHelp.jsx       ← intake wizard (NEW)
│           ├── Resources.jsx     ← categorized library (NEW)
│           ├── Pantries.jsx
│           ├── Chatbot.jsx       ← now Ollama-aware
│           ├── Login.jsx / Register.jsx
│           ├── FoodRecovery.jsx
│           ├── Volunteers.jsx
│           ├── Donors.jsx / Donate.jsx
│           ├── MealPlanner.jsx
│           └── Youth.jsx
├── run-backend.bat
├── run-frontend.bat
└── README.md
```

## After this change

If you already have `backend/food_resources.db` from the previous version, **delete it** so the new tables (Resource, plus new columns on Pantry and User) get created from scratch with the expanded seed data:
```powershell
Remove-Item "sewa food insecurity project\backend\food_resources.db"
```
Then restart the backend.
