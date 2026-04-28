from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "CompanionAI"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    MISTRAL_API_KEY: str = ""
    CHROMA_PERSIST_DIR: str = "./chroma_data"
    
    class Config:
        env_file = ".env"

settings = Settings()