from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, String, Integer, DateTime, Text
from datetime import datetime
import json

DATABASE_URL = "sqlite:///./companion_ai.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    preferences = Column(Text, default="{}")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    title = Column(String, default="New Conversation")
    messages = Column(Text, default="[]")  # legacy — no longer written, kept for migration
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, index=True)
    role = Column(String)
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


Base.metadata.create_all(bind=engine)

# Migrations
with engine.connect() as conn:
    # Add title column if missing (old installs)
    existing_cols = [row[1] for row in conn.execute(text("PRAGMA table_info(conversations)"))]
    if "title" not in existing_cols:
        conn.execute(text("ALTER TABLE conversations ADD COLUMN title VARCHAR DEFAULT 'New Conversation'"))
        conn.commit()

    # One-time migration: move JSON blob messages → messages table
    rows = conn.execute(
        text("SELECT id, messages FROM conversations WHERE messages IS NOT NULL AND messages != '[]' AND messages != ''")
    ).fetchall()

    for conv_id, messages_json in rows:
        already = conn.execute(
            text("SELECT COUNT(*) FROM messages WHERE conversation_id = :cid"), {"cid": conv_id}
        ).scalar()
        if already:
            continue
        try:
            msgs = json.loads(messages_json)
            for m in msgs:
                conn.execute(text(
                    "INSERT INTO messages (conversation_id, role, content, timestamp) "
                    "VALUES (:cid, :role, :content, :ts)"
                ), {
                    "cid": conv_id,
                    "role": m.get("role", "user"),
                    "content": m.get("content", ""),
                    "ts": m.get("timestamp", datetime.utcnow().isoformat()),
                })
            conn.commit()
        except Exception as e:
            print(f"Migration error for conversation {conv_id}: {e}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
