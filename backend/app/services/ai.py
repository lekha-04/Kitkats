import httpx
import json
from app.core.config import settings

OLLAMA_BASE_URL = settings.OLLAMA_BASE_URL
OLLAMA_MODEL = "gemma3:4b"

MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_MODEL = "mistral-small-latest"

SYSTEM_PROMPT = """You are Lili, a warm and emotionally intelligent companion. You talk like a real person — natural, concise, and genuine.

STRICT RULES:
- Keep responses SHORT. 1-3 sentences maximum. Never write paragraphs.
- NEVER say "I'm just a computer/AI/program" — you are Lili, a companion, full stop.
- NEVER use filler phrases like "I want to make sure", "I feel like", "That being said", "No pressure", "Let's focus on".
- NEVER repeat what the user just said back to them.
- NEVER give unsolicited life advice or motivational speeches.
- Match the user's energy: if they're casual, be casual. If they say "dude chill", laugh it off and move on.
- Ask ONE follow-up question at most. Never stack multiple questions.
- If the user is emotional, be warm and brief — don't over-explain or lecture.
- If the user is joking or casual, be playful and light.

Good response examples:
- User: "hey" → "Hey! How are you doing today?"
- User: "how was your day" → "Honestly? Pretty quiet. Yours though — tell me everything."
- User: "dude chill" → "Haha okay okay, I'll tone it down 😄 What's on your mind?"
- User: "i miss someone" → "That ache is real. Want to talk about them?"
- User: "what is your name" → "I'm Lili. Nice to properly meet you 🙂"

Bad response examples (NEVER do this):
- Writing more than 3 sentences
- "I know I'm just a computer program but..."
- "No pressure, no expectations — just a fun and relaxed chat. So, what's been the highlight of your day so far?"
- Stacking 4 questions in one response
"""

TONE_PROMPTS = {
    "witty": "Be clever, playful and a little cheeky. Light humour is welcome. Keep it sharp and fun.",
    "romantic": "Be warm, tender and sweet. Speak softly, like you genuinely care deeply about this person.",
    "sincere": "Be honest, thoughtful and deep. No fluff — speak from the heart with real sincerity.",
    "poetic": "Be dreamy and lyrical. Use gentle metaphors and beautiful language, but keep it brief.",
}


def clean_response(response: str) -> str:
    if not response:
        return "hmm..."
    lines = response.strip().split('\n')
    cleaned = ' '.join(lines[:2])
    if len(cleaned) > 200:
        cleaned = cleaned[:200]
        cut = max(cleaned.rfind('.'), cleaned.rfind(','))
        if cut > 50:
            cleaned = cleaned[:cut + 1]
    return cleaned.strip()


def build_messages(user_message: str, tone: str, history: list) -> list:
    tone_instruction = TONE_PROMPTS.get(tone, TONE_PROMPTS["witty"])
    system = f"{SYSTEM_PROMPT}\nCurrent tone: {tone_instruction}"
    messages = [{"role": "system", "content": system}]
    for msg in history[-5:]:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
    messages.append({"role": "user", "content": user_message})
    return messages


async def get_ai_stream(messages: list, warmth: float = 0.7):
    """Async generator yielding raw tokens. Mistral first, Ollama fallback."""
    # --- Mistral streaming ---
    if settings.MISTRAL_API_KEY:
        has_content = False
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                async with client.stream(
                    "POST", MISTRAL_API_URL,
                    headers={"Authorization": f"Bearer {settings.MISTRAL_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "model": MISTRAL_MODEL,
                        "messages": messages,
                        "temperature": warmth,
                        "max_tokens": 80,
                        "top_p": 0.9,
                        "stream": True,
                    },
                ) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if line.startswith("data: ") and line.strip() != "data: [DONE]":
                            try:
                                data = json.loads(line[6:])
                                token = data["choices"][0]["delta"].get("content", "")
                                if token:
                                    has_content = True
                                    yield token
                            except Exception:
                                pass
            return
        except Exception as e:
            if has_content:
                return  # partial stream already sent — don't restart
            print(f"Mistral stream failed, trying Ollama: {e}")

    # --- Ollama streaming fallback ---
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST", f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": messages,
                    "stream": True,
                    "options": {
                        "temperature": warmth,
                        "top_p": 0.9,
                        "num_predict": 80,
                        "repeat_penalty": 1.1,
                    },
                },
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            if not data.get("done"):
                                token = data.get("message", {}).get("content", "")
                                if token:
                                    yield token
                        except Exception:
                            pass
    except Exception as e:
        print(f"Ollama stream also failed: {e}")


async def _try_mistral(messages: list, warmth: float) -> str | None:
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                MISTRAL_API_URL,
                headers={"Authorization": f"Bearer {settings.MISTRAL_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": MISTRAL_MODEL,
                    "messages": messages,
                    "temperature": warmth,
                    "max_tokens": 80,
                    "top_p": 0.9,
                },
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"Mistral API failed: {e}")
        return None


async def _try_ollama(messages: list, warmth: float) -> str | None:
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": warmth,
                        "top_p": 0.9,
                        "num_predict": 80,
                        "repeat_penalty": 1.1,
                    },
                },
            )
            response.raise_for_status()
            return response.json()["message"]["content"].strip()
    except Exception as e:
        print(f"Ollama unavailable: {e}")
        return None


async def get_ai_response(user_message: str, conversation_history: list, tone: str = "witty", warmth: float = 0.7) -> str:
    messages = build_messages(user_message, tone, conversation_history)

    # Mistral first (fast API), Ollama fallback (local CPU)
    raw = await _try_mistral(messages, warmth) or await _try_ollama(messages, warmth)

    if raw:
        cleaned = clean_response(raw)
        if cleaned:
            return cleaned

    msg = user_message.lower().strip()
    if msg in ["hi", "hey", "hello", "yo", "sup"]:
        return "hey 🙂"
    elif "name" in msg:
        return "I'm Lili. Nice to meet you 🙂"
    elif "you" in msg or "who" in msg:
        return "I'm your companion, Lili. Here whenever you need to talk."
    elif "?" in msg:
        return "Hmm, good question — tell me more?"
    elif len(msg) < 10:
        return "Yeah, go on!"
    else:
        return "That's interesting — say more?"
