from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.routes import auth, chat, user

app = FastAPI(
    title="CompanionAI", 
    description="AI Companion Chatbot API",
    docs_url="/docs",
    redoc_url="/redoc"
)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(user.router)

@app.on_event("startup")
async def check_config():
    if not settings.MISTRAL_API_KEY or settings.MISTRAL_API_KEY == "your-mistral-api-key-here":
        print("⚠️  WARNING: MISTRAL_API_KEY not set in .env")
    else:
        print("✅ Mistral API key loaded.")

@app.get("/")
async def root():
    return {"message": "Welcome to CompanionAI API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
