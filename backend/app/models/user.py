from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserPreferences(BaseModel):
    name: Optional[str] = None

class UserProfile(BaseModel):
    username: str
    email: str
    preferences: Optional[UserPreferences] = None