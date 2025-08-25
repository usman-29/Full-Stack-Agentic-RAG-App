"""Configuration settings for the FastAPI application."""

import os
from typing import Optional


class Settings:
    """Application settings."""
    
    # API Settings
    API_TITLE: str = "Agentic RAG API"
    API_DESCRIPTION: str = "Intelligent RAG system with routing, grading, and web search capabilities"
    API_VERSION: str = "1.0.0"
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True
    
    # CORS Settings
    CORS_ORIGINS: list = ["*"]  # Configure appropriately for production
    
    # File Upload Settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: set = {".txt"}
    
    # RAG Settings
    DOCUMENTS_DIR: str = "documents"
    CHROMA_DB_DIR: str = "chroma_db"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    RETRIEVAL_K: int = 4
    
    # Environment Variables
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    TAVILY_API_KEY: Optional[str] = os.getenv("TAVILY_API_KEY")
    
    # Authentication Settings
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/v1/auth/callback")
    
    # JWT Settings
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/agentic_rag")


settings = Settings()
