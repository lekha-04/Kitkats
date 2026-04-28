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
    conversation_id: Optional[int] = None

class ChatResponse(BaseModel):
    reply: str
    timestamp: datetime
    conversation_id: int

class ChatHistoryResponse(BaseModel):
    messages: List[Message]

class ConversationSummary(BaseModel):
    id: int
    title: str
    preview: str
    updated_at: datetime

class NewConversationResponse(BaseModel):
    conversation_id: int
    title: str
