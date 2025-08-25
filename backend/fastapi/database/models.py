"""Database models for user authentication and conversations."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from .connection import Base


class User(Base):
    """User model for storing authentication information."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    picture = Column(Text, nullable=True)
    given_name = Column(String(255), nullable=True)
    family_name = Column(String(255), nullable=True)
    locale = Column(String(10), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', name='{self.name}')>"

    # Relationship to conversations
    conversations = relationship(
        "Conversation", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        """Convert user object to dictionary."""
        return {
            "id": self.id,
            "google_id": self.google_id,
            "email": self.email,
            "name": self.name,
            "picture": self.picture,
            "given_name": self.given_name,
            "family_name": self.family_name,
            "locale": self.locale,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None
        }


class Conversation(Base):
    """Conversation model for storing chat threads."""

    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False, default="New Conversation")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan")
    summary = relationship("ConversationSummary", back_populates="conversation",
                           uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Conversation(id={self.id}, user_id={self.user_id}, title='{self.title}')>"

    def to_dict(self):
        """Convert conversation object to dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "message_count": len(self.messages) if self.messages else 0
        }


class Message(Base):
    """Message model for storing individual chat messages."""

    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey(
        "conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    # For assistant messages: vectorstore, web_search, direct_llm
    route_taken = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self):
        return f"<Message(id={self.id}, role='{self.role}', conversation_id={self.conversation_id})>"

    def to_dict(self):
        """Convert message object to dictionary."""
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "role": self.role,
            "content": self.content,
            "route_taken": self.route_taken,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }


class ConversationSummary(Base):
    """Conversation summary model for storing summarized older messages."""

    __tablename__ = "conversation_summaries"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey(
        "conversations.id"), nullable=False, unique=True)
    summary_text = Column(Text, nullable=False)
    messages_summarized_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    # Relationships
    conversation = relationship("Conversation", back_populates="summary")

    def __repr__(self):
        return f"<ConversationSummary(id={self.id}, conversation_id={self.conversation_id})>"

    def to_dict(self):
        """Convert summary object to dictionary."""
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "summary_text": self.summary_text,
            "messages_summarized_count": self.messages_summarized_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
