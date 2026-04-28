import chromadb
from app.core.config import settings
import ollama
from datetime import datetime

chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)

def get_embedding(text: str) -> list:
    try:
        response = ollama.embeddings(model="nomic-embed-text", prompt=text)
        return response["embedding"]
    except:
        return [0] * 768

def get_collection(user_id: str):
    return chroma_client.get_or_create_collection(name=f"memories_{user_id}")

def store_memory(user_id: str, content: str, importance: float = 1.0):
    collection = get_collection(user_id)
    memory_id = f"memory_{datetime.utcnow().timestamp()}"
    
    embedding = get_embedding(content)
    
    collection.add(
        documents=[content],
        embeddings=[embedding],
        ids=[memory_id]
    )

def retrieve_memories(user_id: str, query: str, n_results: int = 3) -> str:
    """Returns a formatted string of relevant past memories, or empty string if none."""
    try:
        query_embedding = get_embedding(query)
        
        collection = get_collection(user_id)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        if not results or not results.get("documents") or not results["documents"][0]:
            return ""
        
        memories = results["documents"][0]
        return "\n".join(f"- {mem}" for mem in memories)
    except Exception as e:
        print(f"Error retrieving memories: {e}")
        return ""