"""Pydantic models for conversation-related requests and responses."""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ConversationCreate(BaseModel):
    """Request model for creating a new conversation."""
    title: str = Field(...,
                       description="Title for the conversation", max_length=255)


class ConversationResponse(BaseModel):
    """Response model for conversation information."""
    id: int
    title: str
    is_active: bool
    created_at: str
    updated_at: str
    message_count: int


class MessageResponse(BaseModel):
    """Response model for individual messages."""
    id: int
    conversation_id: int
    role: str
    content: str
    route_taken: Optional[str] = None
    timestamp: str


class ConversationHistoryResponse(BaseModel):
    """Response model for conversation history."""
    conversation: ConversationResponse
    messages: List[MessageResponse]
    summary: Optional[str] = None


class ConversationListResponse(BaseModel):
    """Response model for list of conversations."""
    conversations: List[ConversationResponse]
    total: int


class ChatRequest(BaseModel):
    """Enhanced request model for chat with conversation support."""
    question: str = Field(..., description="The question to ask", min_length=1)
    conversation_id: Optional[int] = Field(
        None, description="ID of the conversation to continue")


class ChatResponse(BaseModel):
    """Enhanced response model for chat with conversation info."""
    question: str
    answer: str
    route_taken: str
    conversation_id: int
    documents_used: Optional[List[str]] = None
    processing_info: Optional[dict] = None
