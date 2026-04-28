import httpx
from app.core.config import settings

OLLAMA_BASE_URL = "http://localhost:11434"
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

async def _try_ollama(messages: list) -> str | None:
    """Try Ollama (gemma3:4b) first. Returns None if Ollama is unavailable."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": 0.85,
                        "top_p": 0.9,
                        "num_predict": 80,
                        "repeat_penalty": 1.1
                    }
                }
            )
            response.raise_for_status()
            return response.json()["message"]["content"].strip()
    except Exception as e:
        print(f"Ollama unavailable, falling back to Mistral: {e}")
        return None

async def _try_mistral(messages: list) -> str | None:
    """Fallback to Mistral API. Returns None if also unavailable."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                MISTRAL_API_URL,
                headers={
                    "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": MISTRAL_MODEL,
                    "messages": messages,
                    "temperature": 0.85,
                    "max_tokens": 80,
                    "top_p": 0.9
                }
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"Mistral API also failed: {e}")
        return None

async def get_ai_response(user_message: str, conversation_history: list, tone: str = "witty") -> str:
    messages = build_messages(user_message, tone, conversation_history)

    raw = await _try_ollama(messages) or await _try_mistral(messages)

    if raw:
        cleaned = clean_response(raw)
        if cleaned:
            return cleaned

    # Both failed — smart static fallback
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
