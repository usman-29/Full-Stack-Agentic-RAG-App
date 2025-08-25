from typing import List, Optional
from pydantic import BaseModel, Field

# Import conversation schemas for backward compatibility
from models.conversation_schemas import ChatRequest, ChatResponse


class QuestionRequest(BaseModel):
    """Request model for asking questions."""
    question: str = Field(...,
                          description="The question to ask the RAG system", min_length=1)


class QuestionResponse(BaseModel):
    """Response model for question answers."""
    question: str
    answer: str
    route_taken: str = Field(...,
                             description="Route taken: vectorstore, web_search, or direct_llm")
    documents_used: Optional[List[str]] = Field(
        None, description="Documents used in the response")
    processing_info: Optional[dict] = Field(
        None, description="Additional processing information")


class DocumentUploadRequest(BaseModel):
    """Request model for document upload paths."""
    document_paths: List[str] = Field(...,
                                      description="List of document file paths to upload")


class DocumentUploadResponse(BaseModel):
    """Response model for document upload."""
    message: str
    documents_added: int
    duplicates_filtered: int
    total_documents_processed: int


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    message: str


class ErrorResponse(BaseModel):
    """Response model for errors."""
    error: str
    detail: str
    status_code: int


class UserResponse(BaseModel):
    """Response model for user information."""
    id: int
    email: str
    name: str
    picture: Optional[str] = None
    given_name: Optional[str] = None
    family_name: Optional[str] = None
    locale: Optional[str] = None
    is_active: bool
    created_at: Optional[str] = None
    last_login: Optional[str] = None


class AuthResponse(BaseModel):
    """Response model for authentication."""
    message: str
    user: Optional[UserResponse] = None
    authenticated: bool = True
