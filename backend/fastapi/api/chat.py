from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from auth.middleware import require_auth, optional_auth
from models.conversation_schemas import ChatRequest, ChatResponse
from services.rag_service import rag_service

chat_router = APIRouter()


@chat_router.post("/ask", response_model=ChatResponse)
async def ask_question(
    request: ChatRequest,
    current_user=Depends(optional_auth),
    db: Session = Depends(get_db)
):
    """
    Ask a question to the agentic RAG system with conversation memory.

    The system will:
    1. Load conversation context if user is authenticated
    2. Route the question to appropriate data source (vectorstore, web_search, or direct_llm)
    3. Retrieve relevant documents if needed
    4. Grade document relevance
    5. Generate answer with quality control and conversation context
    6. Save the conversation if user is authenticated
    7. Return structured response with conversation info
    """
    try:
        # Call RAG service with conversation context
        result = await rag_service.ask_question(
            question=request.question,
            user_id=current_user.id if current_user else None,
            conversation_id=request.conversation_id,
            db=db if current_user else None
        )

        return ChatResponse(
            question=result["question"],
            answer=result["answer"],
            route_taken=result["route_taken"],
            conversation_id=result.get("conversation_id", 0),
            documents_used=result["documents_used"],
            processing_info=result["processing_info"]
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@chat_router.post("/ask-anonymous")
async def ask_question_anonymous(request: ChatRequest):
    """
    Ask a question without authentication (no conversation memory).

    This endpoint provides the same RAG functionality but without:
    - Conversation memory
    - Message persistence
    - User-specific context
    """
    try:
        # Call RAG service without conversation context
        result = await rag_service.ask_question(request.question)

        return {
            "question": result["question"],
            "answer": result["answer"],
            "route_taken": result["route_taken"],
            "documents_used": result["documents_used"],
            "processing_info": result["processing_info"],
            "conversation_id": None
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@chat_router.get("/routes")
async def get_available_routes():
    """Get information about available routing strategies."""
    return {
        "routes": [
            {
                "name": "vectorstore",
                "description": "Route to vector database for ML-related questions (agents, prompt engineering, adversarial attacks)",
                "use_case": "Questions about machine learning concepts stored in the knowledge base"
            },
            {
                "name": "web_search",
                "description": "Route to web search for external information",
                "use_case": "Current events, specific facts, or topics not in the knowledge base"
            },
            {
                "name": "direct_llm",
                "description": "Direct LLM response for generic questions",
                "use_case": "Small talk, greetings, simple math, basic conversations"
            }
        ]
    }
