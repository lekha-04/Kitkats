from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
import json
from app.models.chat import ChatRequest, ChatResponse, ChatHistoryResponse, Message, ConversationSummary, NewConversationResponse
from app.core.database import get_db, Conversation, ChatMessage, SessionLocal
from app.core.security import get_current_user
from app.services.ai import get_ai_response, get_ai_stream, build_messages, clean_response
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
        conv = Conversation(user_id=int(user_id), title="New Conversation")
        db.add(conv)
        db.commit()
        db.refresh(conv)
    return conv


@router.post("/new", response_model=NewConversationResponse)
async def new_conversation(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = Conversation(user_id=int(user_id), title="New Conversation")
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
        last_msg = db.query(ChatMessage).filter(
            ChatMessage.conversation_id == conv.id
        ).order_by(ChatMessage.timestamp.desc()).first()
        preview = last_msg.content[:50] if last_msg else "No messages yet"
        result.append(ConversationSummary(
            id=conv.id,
            title=conv.title,
            preview=preview,
            updated_at=conv.updated_at,
        ))
    return result


@router.post("/send", response_model=ChatResponse)
async def send_message(request: ChatRequest, background_tasks: BackgroundTasks, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    if request.conversation_id:
        conv = get_conversation(request.conversation_id, user_id, db)
    else:
        conv = get_or_create_default(user_id, db)

    history_msgs = db.query(ChatMessage).filter(
        ChatMessage.conversation_id == conv.id
    ).order_by(ChatMessage.timestamp.desc()).limit(5).all()
    history = [{"role": m.role, "content": m.content} for m in reversed(history_msgs)]

    ai_reply = await get_ai_response(
        user_message=request.message,
        conversation_history=history,
        tone=request.tone,
        warmth=request.warmth or 0.7,
    )

    timestamp = datetime.utcnow()
    db.add(ChatMessage(conversation_id=conv.id, role="user", content=request.message, timestamp=timestamp))
    db.add(ChatMessage(conversation_id=conv.id, role="assistant", content=ai_reply, timestamp=timestamp))

    conv.updated_at = timestamp
    if conv.title == "New Conversation" and request.message:
        conv.title = request.message[:40]
    db.commit()

    if len(request.message) > 20:
        background_tasks.add_task(store_memory, user_id, f"User mentioned: {request.message[:100]}")

    return ChatResponse(reply=ai_reply, timestamp=timestamp, conversation_id=conv.id)


@router.post("/stream")
async def stream_message(request: ChatRequest, background_tasks: BackgroundTasks, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    if request.conversation_id:
        conv = get_conversation(request.conversation_id, user_id, db)
    else:
        conv = get_or_create_default(user_id, db)

    conv_id = conv.id
    warmth = request.warmth or 0.7

    history_msgs = db.query(ChatMessage).filter(
        ChatMessage.conversation_id == conv_id
    ).order_by(ChatMessage.timestamp.desc()).limit(5).all()
    history = [{"role": m.role, "content": m.content} for m in reversed(history_msgs)]

    # Store user message before streaming begins
    timestamp = datetime.utcnow()
    db.add(ChatMessage(conversation_id=conv_id, role="user", content=request.message, timestamp=timestamp))
    if conv.title == "New Conversation" and request.message:
        conv.title = request.message[:40]
    conv.updated_at = timestamp
    db.commit()

    messages_for_llm = build_messages(request.message, request.tone or "witty", history)

    async def event_generator():
        tokens = []
        try:
            async for token in get_ai_stream(messages_for_llm, warmth):
                tokens.append(token)
                yield f"data: {json.dumps({'token': token, 'conversation_id': conv_id})}\n\n"
        except Exception as e:
            print(f"Stream error: {e}")

        # Save AI reply with a fresh session (original session is closed after the route returned)
        ai_content = clean_response("".join(tokens)) if tokens else "Something went wrong."
        save_db = SessionLocal()
        try:
            save_db.add(ChatMessage(
                conversation_id=conv_id,
                role="assistant",
                content=ai_content,
                timestamp=datetime.utcnow(),
            ))
            save_db.query(Conversation).filter(Conversation.id == conv_id).update({"updated_at": datetime.utcnow()})
            save_db.commit()
        finally:
            save_db.close()

        if len(request.message) > 20:
            store_memory(user_id, f"User mentioned: {request.message[:100]}")

        yield f"data: {json.dumps({'done': True, 'conversation_id': conv_id})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/history", response_model=ChatHistoryResponse)
async def get_history(conversation_id: int, limit: int = 50, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    get_conversation(conversation_id, user_id, db)
    msgs = db.query(ChatMessage).filter(
        ChatMessage.conversation_id == conversation_id
    ).order_by(ChatMessage.timestamp.desc()).limit(limit).all()
    msgs = list(reversed(msgs))
    return ChatHistoryResponse(messages=[Message(role=m.role, content=m.content, timestamp=m.timestamp) for m in msgs])


@router.delete("/clear")
async def clear_chat(conversation_id: int, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = get_conversation(conversation_id, user_id, db)
    db.query(ChatMessage).filter(ChatMessage.conversation_id == conversation_id).delete()
    conv.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Chat cleared"}
