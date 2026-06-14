# Sewa Food Resources

A food-resources hub for Los Angeles County and the wider SoCal region, focused on people **ineligible for SNAP/CalFresh** — undocumented residents, mixed-status families, recent immigrants, students, seniors, and people just over the income line.

- **Frontend:** React + Vite + React Router
- **Backend:** FastAPI + SQLAlchemy
- **Database:** SQLite locally, PostgreSQL in production (chosen automatically — see "Database" below)
- **Auth:** JWT (email + password, bcrypt hashed) with optional Google sign-in
- **AI:** Google Gemini (gemini-2.5-flash) with graceful fallback to rule-based chat
- **i18n:** 15 languages — English, Spanish, Chinese, Vietnamese, Korean, Tagalog, Japanese, Hindi, French, Thai, Armenian, Russian, Khmer, Arabic, Farsi (Arabic & Farsi render right-to-left)
- **Maps:** Leaflet + OpenStreetMap (no API key), with browser geolocation
- **Live data:** Real curated resources from Southern California and Los Angeles County

## Features

### Tailored to SNAP-ineligible communities
- **Get Help wizard** — pick your situation (undocumented, mixed-status, student, senior, recent immigrant, denied SNAP, no kitchen, no address) and get a ranked list of matched resources, saved to your account
- **Resources library** — 35 curated SoCal entries across 10 categories with multi-select filtering: community fridges, mutual aid, WIC, school meals, senior programs, student programs, immigrant orgs, legal aid, know-your-rights, hotlines
- **Trust badges** on every card — "No ID needed", "Immigration-safe", language coverage
- **"You are safe here" header** on every page + a home-page "Is this site for you?" section that names the audience directly

### Core feature set
- Email/password signup and login, plus optional Google authentication
- Food pantries on a Leaflet map (26 real LA/SoCal locations) with no-eligibility / no-ID / immigration-safe filters and "use my location"; a "call ahead — hours change" note is shown since hours shift seasonally
- Food Recovery — businesses post excess food, volunteers/nonprofits claim pickups; plus 11 real food-recovery programs (donation apps, free sharing, rescued-food stores) with multi-select filters
- Volunteer directory + self-service volunteer sign-up form (searchable by ZIP and language)
- Donor sign-up with a "claim this donation" flow and a recommended/not-accepted donation guide
- Budget meal planner — 50+ plans from $10–$100, with multi-select diet filters (No restrictions, vegetarian, vegan, halal, gluten-free, diabetic-friendly) plus a max-budget filter
- Donation page — Venmo deep links (preset + custom amounts) and a QR code
- Youth programs (17 real programs) with multi-select age filters

> **Data note:** All pantry addresses/phones and resource websites/phones were verified against official sources. Filters across Resources, Food Recovery, Youth, and Meal Planner are multi-select (pick several at once; "All" clears). Pantry hours and annually-set figures (e.g. Summer EBT, CalFresh maximums) are approximate and link to official sources.

### AI chatbot
- Calls **Google Gemini** when a key is configured, falls back to rule-based replies otherwise
- Status indicator in the UI shows which mode it's in (🟢 AI online / 🟡 Fallback)
- System prompt is tuned for warm, plain-language help for SNAP-ineligible users (see `backend/gemini_client.py`)

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

## Configuration (environment variables)

Nothing secret lives in the code — it's all read from environment variables, with safe local fallbacks. Locally these go in **`backend/.env`** (gitignored, never pushed). In production they go in your host's dashboard.

| Variable | Used for | Local default if unset |
|---|---|---|
| `GEMINI_API_KEY` | AI chatbot (Google Gemini) | none → chatbot uses rule-based fallback |
| `GEMINI_MODEL` | which Gemini model | `gemini-2.5-flash` |
| `DATABASE_URL` | database connection | SQLite file `food_resources.db` |
| `JWT_SECRET` | signs login tokens | a placeholder (override in production) |
| `FRONTEND_ORIGIN` | CORS allow-list for the deployed frontend | localhost only |
| `GOOGLE_CLIENT_ID` | (optional) verifies Google sign-in tokens | not enforced |

The frontend reads two build-time variables (in **`frontend/.env`**, also gitignored):

| Variable | Used for |
|---|---|
| `VITE_API_URL` | backend URL (defaults to `http://127.0.0.1:8000` locally) |
| `VITE_GOOGLE_CLIENT_ID` | Google sign-in button |

## Setting up the AI chatbot (Google Gemini)

1. Get a free API key at https://aistudio.google.com/apikey
2. Put it in `backend/.env`:
   ```
   GEMINI_API_KEY=your-key-here
   GEMINI_MODEL=gemini-2.5-flash
   ```
3. Restart the backend. The chatbot's status badge switches from 🟡 "Fallback mode" to 🟢 "AI online".

If no key is set (or a request fails), the chatbot still works — it just uses the rule-based responses.

> Note: different Google accounts have free quota on different models. If you get a `429 / RESOURCE_EXHAUSTED` error with `limit: 0`, that model has no free quota on your account — try `gemini-2.5-flash` or `gemini-flash-latest` instead.

## Database

Your code automatically picks the database from the `DATABASE_URL` environment variable — **you never edit `database.py` to switch.**

- **Locally:** `DATABASE_URL` is unset, so it falls back to SQLite (`backend/food_resources.db`). Zero setup.
- **In production:** set `DATABASE_URL` to a PostgreSQL connection string and the same code uses Postgres instead.

```python
# backend/database.py — the relevant line (no editing needed):
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./food_resources.db")
```

**Why this matters for deployment:** hosts like Render have an *ephemeral filesystem* — the SQLite file gets wiped on every restart/redeploy, erasing user accounts and signups. PostgreSQL runs on its own server, so data persists. User accounts, donors, volunteers, food listings, and intake answers all live in whichever database is configured; passwords are bcrypt-hashed and auth uses JWT tokens.

`psycopg2-binary` (the Postgres driver) is already in `requirements.txt`, so no extra install is needed.

## Live data (211 LA API — optional)

The seeded pantries and resources are real LA/SoCal organizations. To pull even more pantries from 211 LA County:

1. Apply for a partner API key at https://www.211la.org/partner-with-us — review takes ~1-2 weeks
2. Once approved, set the key in your backend shell:
   ```powershell
   $env:TWO_ONE_ONE_API_KEY = "your-key-here"
   ```
3. Pull data into your DB:
   ```powershell
   python refresh_data.py 211
   ```

The integration code is in `backend/integrations/two_one_one_la.py`. You'll likely need to adjust the field mapping based on which API tier your key gives you — comments explain what to change. To run on a schedule, wrap it in a Windows Task Scheduler job or cron task that calls `python refresh_data.py 211` daily.

## Deployment (Netlify + Render)

The frontend (React) and backend (FastAPI) deploy to two free hosts. Code is already configured to read all settings from environment variables.

**Push to GitHub** (from the project root, the folder containing both `backend/` and `frontend/`):

```powershell
git add .
git commit -m "Sewa Food Resources"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sewa-food-resources.git
git push -u origin main
```

**Backend on Render:** New Web Service → root directory `backend`, build `pip install -r requirements.txt`, start `uvicorn main:app --host 0.0.0.0 --port $PORT`. Then create a free **PostgreSQL** database and set these environment variables on the web service:

| Key | Value |
|---|---|
| `DATABASE_URL` | the database's **Internal Database URL** |
| `JWT_SECRET` | any long random string |
| `GEMINI_API_KEY` | your Gemini key |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `FRONTEND_ORIGIN` | your Netlify URL (e.g. `https://sewa-food.netlify.app`) |

**Frontend on Netlify:** Import the repo → base directory `frontend`, build `npm run build`, publish `frontend/dist`. Set `VITE_API_URL` (your Render backend URL) and `VITE_GOOGLE_CLIENT_ID`. A `frontend/public/_redirects` file is included so client-side routes don't 404 on refresh.

**Finally:** add your Netlify URL to the Google OAuth client's "Authorized JavaScript origins" so Google sign-in works on the live site.

> Free-tier notes: Render's free web service sleeps after ~15 min idle (first request wakes it in ~30-60s), and free PostgreSQL expires after 90 days. Fine for demos; upgrade or move to Neon/Supabase (free, non-expiring) for a long-term launch.

## Project structure

```
sewa food insecurity project/
├── backend/
│   ├── main.py              # All API routes
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic
│   ├── database.py          # SQLite/Postgres via DATABASE_URL
│   ├── auth.py              # JWT + bcrypt + Google verify
│   ├── gemini_client.py     # Google Gemini chat client
│   ├── seed.py              # Curated real-data seeding
│   ├── refresh_data.py      # Optional 211 LA importer
│   ├── integrations/        # 211 LA API client
│   └── requirements.txt
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── public/_redirects    # Netlify SPA routing
│   └── src/
│       ├── App.jsx
│       ├── api.js           # reads VITE_API_URL
│       ├── styles.css
│       ├── resourceI18n.js  # resource-description translations
│       ├── context/         # AuthContext, LangContext (15 languages)
│       ├── components/       # NavBar, ResourceCard, PantryMap, GoogleSignIn, DemoBanner
│       └── pages/
│           ├── Home.jsx
│           ├── GetHelp.jsx
│           ├── Resources.jsx
│           ├── Pantries.jsx
│           ├── Chatbot.jsx
│           ├── Login.jsx / Register.jsx
│           ├── FoodRecovery.jsx
│           ├── Volunteers.jsx
│           ├── Donors.jsx / Donate.jsx
│           ├── MealPlanner.jsx
│           ├── Youth.jsx
│           └── Contact.jsx
├── run-backend.bat
├── run-frontend.bat
└── README.md
```

## Resetting the local database

If the schema changes and your local SQLite file is out of date, delete it so fresh tables are created and re-seeded on the next backend start:

```powershell
Remove-Item "sewa food insecurity project\backend\food_resources.db"
```

(Static catalogs — meal plans, pantries, resources — re-seed automatically. User data is not seeded.)
