from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.chat import chat_router
from api.documents import documents_router
from api.auth import auth_router
from api.conversations import conversations_router
from database.connection import create_tables
from models.schemas import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    print("Starting Agentic RAG API server...")

    # Create database tables
    try:
        create_tables()
        print("Database tables created/verified successfully")
    except Exception as e:
        print(f"Database initialization error: {e}")

    yield
    print("Shutting down Agentic RAG API server...")


app = FastAPI(
    title="Agentic RAG API",
    description="Intelligent RAG system with routing, grading, and web search capabilities",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(conversations_router,
                   prefix="/api/v1/conversations", tags=["Conversations"])
app.include_router(
    documents_router, prefix="/api/v1/documents", tags=["Documents"])


@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint."""
    return HealthResponse(
        status="success",
        message="Agentic RAG API is running successfully"
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        message="Service is operational"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
