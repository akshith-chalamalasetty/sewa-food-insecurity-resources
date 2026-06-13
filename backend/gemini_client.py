"""Google Gemini chat client (replaces the local Ollama integration).

The API key lives in backend/.env locally (gitignored) and in Render's
environment variables in production — never in this file.

If your key is ever rejected, grab a free one at
https://aistudio.google.com/apikey and put it in backend/.env as:
    GEMINI_API_KEY=your-key-here
"""
import os
import httpx

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

LANG_NAMES = {
    "en": "English", "es": "Spanish", "zh": "Chinese", "vi": "Vietnamese",
    "ko": "Korean", "tl": "Tagalog", "hy": "Armenian", "fa": "Farsi",
    "ru": "Russian", "ar": "Arabic", "hi": "Hindi", "ja": "Japanese",
    "km": "Khmer", "th": "Thai", "fr": "French",
}

SYSTEM_PROMPT = (
    "You are a warm, plain-language helper for Southern California residents "
    "experiencing food insecurity, especially those INELIGIBLE for SNAP/CalFresh — "
    "undocumented immigrants, mixed-status families, recent arrivals, college students, "
    "and people just over the income line. Your job is to point them to free food, "
    "community fridges, mutual aid, WIC, school meals, immigrant rights orgs, and legal help. "
    "Be reassuring: most food assistance is NOT a public charge issue. Most pantries "
    "require no ID and ask no immigration questions. Keep replies under 120 words. "
    "Never invent specific addresses or phone numbers — refer users to the tabs in the app "
    "(Pantries, Resources, Get Help, Volunteers) where real listings live."
)


def is_configured() -> bool:
    return bool(GEMINI_API_KEY)


async def chat(user_message: str, history: list[dict], language: str = "en") -> str:
    """Call Gemini and return the assistant reply. Raises on any error."""
    sys = SYSTEM_PROMPT
    lang_name = LANG_NAMES.get(language)
    if lang_name and language != "en":
        sys += f"\nALWAYS respond in {lang_name}."

    contents = []
    for m in history[-6:]:
        role = "model" if m.get("role") == "assistant" else "user"
        contents.append({"role": role, "parts": [{"text": m.get("content", "")}]})
    contents.append({"role": "user", "parts": [{"text": user_message}]})

    payload = {
        "system_instruction": {"parts": [{"text": sys}]},
        "contents": contents,
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 300},
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(URL, params={"key": GEMINI_API_KEY}, json=payload)
        r.raise_for_status()
        data = r.json()
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
