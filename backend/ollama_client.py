"""Tiny Ollama HTTP client used by the chatbot.

Ollama default base URL: http://localhost:11434
Default model: change OLLAMA_MODEL below or set the env var.

To install + run a model:
  ollama pull llama3.2
  ollama serve   (usually already running as a Windows service)
"""
import os
import httpx

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

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


async def chat(user_message: str, history: list[dict], language: str = "en") -> str:
    """Call Ollama and return the assistant reply. Raises on network/model error."""
    sys = SYSTEM_PROMPT
    if language == "es":
        sys += "\nALWAYS respond in Spanish."

    messages = [{"role": "system", "content": sys}]
    # Trim history to last ~6 turns to keep prompt tight
    messages.extend(history[-6:])
    messages.append({"role": "user", "content": user_message})

    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.post(
            f"{OLLAMA_URL}/api/chat",
            json={
                "model": OLLAMA_MODEL,
                "messages": messages,
                "stream": False,
                "options": {"temperature": 0.4},
            },
        )
        r.raise_for_status()
        data = r.json()
        return data["message"]["content"].strip()
