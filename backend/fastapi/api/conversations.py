"""Conversation management API routes."""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from auth.middleware import require_auth
from models.conversation_schemas import (
    ConversationCreate, ConversationResponse, ConversationListResponse,
    ConversationHistoryResponse, MessageResponse
)
from services.conversation_service import conversation_service


conversations_router = APIRouter()


@conversations_router.post("/", response_model=ConversationResponse)
async def create_conversation(
    request: ConversationCreate,
    current_user=Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Create a new conversation."""
    try:
        conversation = conversation_service.create_conversation(
            user_id=current_user.id,
            title=request.title,
            db=db
        )
        return ConversationResponse(**conversation.to_dict())

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create conversation: {str(e)}"
        )


@conversations_router.get("/", response_model=ConversationListResponse)
async def get_conversations(
    limit: int = 50,
    current_user=Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Get all conversations for the current user."""
    try:
        conversations = conversation_service.get_user_conversations(
            user_id=current_user.id,
            db=db,
            limit=limit
        )

        conversation_responses = [
            ConversationResponse(**conv.to_dict()) for conv in conversations
        ]

        return ConversationListResponse(
            conversations=conversation_responses,
            total=len(conversation_responses)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get conversations: {str(e)}"
        )


@conversations_router.get("/{conversation_id}", response_model=ConversationHistoryResponse)
async def get_conversation_history(
    conversation_id: int,
    current_user=Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Get full conversation history."""
    try:
        # Get conversation
        conversation = conversation_service.get_conversation(
            conversation_id=conversation_id,
            user_id=current_user.id,
            db=db
        )

        if not conversation:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )

        # Get messages
        messages = conversation_service.get_conversation_messages(
            conversation_id=conversation_id,
            user_id=current_user.id,
            db=db
        )

        # Get context (includes summary)
        context = conversation_service.get_conversation_context(
            conversation_id, db)

        message_responses = [MessageResponse(
            **msg.to_dict()) for msg in messages]

        return ConversationHistoryResponse(
            conversation=ConversationResponse(**conversation.to_dict()),
            messages=message_responses,
            summary=context.get("summary")
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get conversation history: {str(e)}"
        )


@conversations_router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user=Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Delete (deactivate) a conversation."""
    try:
        success = conversation_service.delete_conversation(
            conversation_id=conversation_id,
            user_id=current_user.id,
            db=db
        )

        if not success:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )

        return {"message": "Conversation deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete conversation: {str(e)}"
        )


@conversations_router.get("/{conversation_id}/context")
async def get_conversation_context(
    conversation_id: int,
    current_user=Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Get conversation context (summary + recent messages) for debugging."""
    try:
        # Verify user owns the conversation
        conversation = conversation_service.get_conversation(
            conversation_id=conversation_id,
            user_id=current_user.id,
            db=db
        )

        if not conversation:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )

        context = conversation_service.get_conversation_context(
            conversation_id, db)
        return context

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get conversation context: {str(e)}"
        )
