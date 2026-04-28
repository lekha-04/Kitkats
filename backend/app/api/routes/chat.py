from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import json
from app.models.chat import ChatRequest, ChatResponse, ChatHistoryResponse, Message, ConversationSummary, NewConversationResponse
from app.core.database import get_db, Conversation
from app.core.security import get_current_user
from app.services.ai import get_ai_response
from app.services.memory import store_memory

router = APIRouter(prefix="/chat", tags=["chat"])

def get_conversation(conversation_id: int, user_id: str, db: Session) -> Conversation:
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == int(user_id)
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv

def get_or_create_default(user_id: str, db: Session) -> Conversation:
    conv = db.query(Conversation).filter(
        Conversation.user_id == int(user_id)
    ).order_by(Conversation.updated_at.desc()).first()
    if not conv:
        conv = Conversation(user_id=int(user_id), title="New Conversation", messages="[]")
        db.add(conv)
        db.commit()
        db.refresh(conv)
    return conv

@router.post("/new", response_model=NewConversationResponse)
async def new_conversation(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = Conversation(user_id=int(user_id), title="New Conversation", messages="[]")
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return NewConversationResponse(conversation_id=conv.id, title=conv.title)

@router.get("/conversations", response_model=list[ConversationSummary])
async def list_conversations(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    convs = db.query(Conversation).filter(
        Conversation.user_id == int(user_id)
    ).order_by(Conversation.updated_at.desc()).all()

    result = []
    for conv in convs:
        messages = json.loads(conv.messages or "[]")
        preview = messages[-1]["content"][:50] if messages else "No messages yet"
        result.append(ConversationSummary(
            id=conv.id,
            title=conv.title,
            preview=preview,
            updated_at=conv.updated_at
        ))
    return result

@router.post("/send", response_model=ChatResponse)
async def send_message(request: ChatRequest, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    if request.conversation_id:
        conv = get_conversation(request.conversation_id, user_id, db)
    else:
        conv = get_or_create_default(user_id, db)

    messages = json.loads(conv.messages or "[]")

    history = [
        {"role": "user" if m.get("role") == "user" else "assistant", "content": m.get("content", "")}
        for m in messages[-5:]
    ]

    ai_reply = await get_ai_response(
        user_message=request.message,
        conversation_history=history,
        tone=request.tone
    )

    timestamp = datetime.utcnow()

    messages = messages + [
        {"role": "user", "content": request.message, "timestamp": timestamp.isoformat()},
        {"role": "assistant", "content": ai_reply, "timestamp": timestamp.isoformat()}
    ]
    conv.messages = json.dumps(messages)
    conv.updated_at = timestamp

    # Auto-title from first user message
    if conv.title == "New Conversation" and request.message:
        conv.title = request.message[:40]

    db.commit()

    if len(request.message) > 20:
        store_memory(user_id, f"User mentioned: {request.message[:100]}")

    return ChatResponse(reply=ai_reply, timestamp=timestamp, conversation_id=conv.id)

@router.get("/history", response_model=ChatHistoryResponse)
async def get_history(conversation_id: int, limit: int = 50, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = get_conversation(conversation_id, user_id, db)
    messages = json.loads(conv.messages or "[]")[-limit:]
    return ChatHistoryResponse(messages=[Message(**m) for m in messages])

@router.delete("/clear")
async def clear_chat(conversation_id: int, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = get_conversation(conversation_id, user_id, db)
    conv.messages = "[]"
    conv.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Chat cleared"}
