from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "CompanionAI"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: str = "sqlite:///./companion_ai.db"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    MISTRAL_API_KEY: str = ""
    CHROMA_PERSIST_DIR: str = "./chroma_data"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    class Config:
        env_file = ".env"

settings = Settings()
