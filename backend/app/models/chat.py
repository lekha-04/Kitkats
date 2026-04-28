from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Message(BaseModel):
    role: str
    content: str
    timestamp: datetime

class ChatRequest(BaseModel):
    message: str
    tone: Optional[str] = "witty"
    warmth: Optional[float] = 0.7

class ChatResponse(BaseModel):
    reply: str
    timestamp: datetime

class ChatHistoryResponse(BaseModel):
    messages: List[Message]

class MessageCreate(BaseModel):
    role: str
    content: str