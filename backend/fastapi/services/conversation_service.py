"""Conversation service for managing chat memory and context."""

from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database.models import User, Conversation, Message, ConversationSummary


class ConversationService:
    """Service for managing conversations and chat memory."""

    def __init__(self):
        self.buffer_size = 6  # Keep last 6 messages in buffer
        self.summary_trigger = 8  # Summarize when more than 8 messages

    def get_or_create_default_conversation(self, user_id: int, db: Session) -> Conversation:
        """Get user's default conversation or create one."""
        # Try to get the most recent active conversation
        conversation = db.query(Conversation).filter(
            Conversation.user_id == user_id,
            Conversation.is_active == True
        ).order_by(desc(Conversation.updated_at)).first()

        if not conversation:
            # Create new default conversation
            conversation = Conversation(
                user_id=user_id,
                title="New Conversation"
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)

        return conversation

    def get_conversation(self, conversation_id: int, user_id: int, db: Session) -> Optional[Conversation]:
        """Get specific conversation for user."""
        return db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
            Conversation.is_active == True
        ).first()

    def create_conversation(self, user_id: int, title: str, db: Session) -> Conversation:
        """Create new conversation for user."""
        conversation = Conversation(
            user_id=user_id,
            title=title
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation

    def get_user_conversations(self, user_id: int, db: Session, limit: int = 50) -> List[Conversation]:
        """Get all conversations for user."""
        return db.query(Conversation).filter(
            Conversation.user_id == user_id,
            Conversation.is_active == True
        ).order_by(desc(Conversation.updated_at)).limit(limit).all()

    def add_message(
        self,
        conversation_id: int,
        role: str,
        content: str,
        route_taken: Optional[str],
        db: Session
    ) -> Message:
        """Add message to conversation."""
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            route_taken=route_taken
        )
        db.add(message)

        # Update conversation timestamp
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id).first()
        if conversation:
            conversation.updated_at = datetime.utcnow()

            # Update title if it's the first user message and still default
            if conversation.title == "New Conversation" and role == "user":
                # Use first 50 characters of first user message as title
                conversation.title = content[:50] + \
                    "..." if len(content) > 50 else content

        db.commit()
        db.refresh(message)
        return message

    def get_conversation_context(self, conversation_id: int, db: Session) -> Dict[str, Any]:
        """Get conversation context for RAG (summary + recent messages)."""
        # Get conversation summary if it exists
        summary = db.query(ConversationSummary).filter(
            ConversationSummary.conversation_id == conversation_id
        ).first()

        # Get recent messages (within buffer size)
        recent_messages = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(desc(Message.timestamp)).limit(self.buffer_size).all()

        # Reverse to get chronological order
        recent_messages.reverse()

        return {
            "summary": summary.summary_text if summary else None,
            "recent_messages": [msg.to_dict() for msg in recent_messages],
            "messages_count": len(recent_messages)
        }

    def build_context_prompt(self, context: Dict[str, Any], new_question: str) -> str:
        """Build enhanced prompt with conversation context."""
        prompt_parts = []

        # Add summary if available
        if context.get("summary"):
            prompt_parts.append(
                f"Previous conversation summary: {context['summary']}")

        # Add recent messages
        recent_messages = context.get("recent_messages", [])
        if recent_messages:
            prompt_parts.append("Recent conversation:")
            for msg in recent_messages:
                role = "Human" if msg["role"] == "user" else "Assistant"
                prompt_parts.append(f"{role}: {msg['content']}")

        # Add current question
        prompt_parts.append(f"Current question: {new_question}")

        return "\n\n".join(prompt_parts)

    def check_and_summarize_if_needed(self, conversation_id: int, db: Session) -> bool:
        """Check if conversation needs summarization and perform it."""
        # Count total messages
        message_count = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).count()

        if message_count <= self.summary_trigger:
            return False

        # Get existing summary
        existing_summary = db.query(ConversationSummary).filter(
            ConversationSummary.conversation_id == conversation_id
        ).first()

        # Determine how many messages to summarize
        messages_to_summarize_count = message_count - self.buffer_size
        already_summarized = existing_summary.messages_summarized_count if existing_summary else 0

        if messages_to_summarize_count <= already_summarized:
            return False

        # Get messages to summarize (oldest ones not yet summarized)
        messages_to_summarize = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.timestamp).offset(already_summarized).limit(
            messages_to_summarize_count - already_summarized
        ).all()

        if not messages_to_summarize:
            return False

        # Create conversation text for summarization
        conversation_text = []
        for msg in messages_to_summarize:
            role = "Human" if msg.role == "user" else "Assistant"
            conversation_text.append(f"{role}: {msg.content}")

        # Generate summary using LLM
        new_summary_part = self._generate_summary("\n".join(conversation_text))

        # Update or create summary
        if existing_summary:
            # Combine with existing summary
            combined_summary = f"{existing_summary.summary_text}\n\n{new_summary_part}"
            existing_summary.summary_text = combined_summary
            existing_summary.messages_summarized_count = messages_to_summarize_count
            existing_summary.updated_at = datetime.utcnow()
        else:
            # Create new summary
            new_summary = ConversationSummary(
                conversation_id=conversation_id,
                summary_text=new_summary_part,
                messages_summarized_count=messages_to_summarize_count
            )
            db.add(new_summary)

        db.commit()
        return True

    def _generate_summary(self, conversation_text: str) -> str:
        """Generate summary of conversation text using LLM."""
        from langchain_openai import ChatOpenAI
        from langchain_core.prompts import ChatPromptTemplate

        llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo")

        summary_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are tasked with creating a concise summary of a conversation between a human and an AI assistant. 
            Focus on:
            - Key topics discussed
            - Important questions asked
            - Main insights or information provided
            - Any specific examples or technical details mentioned
            
            Keep the summary informative but concise (2-3 sentences per major topic)."""),
            ("human", "Summarize this conversation:\n\n{conversation}")
        ])

        try:
            result = llm.invoke(summary_prompt.format_messages(
                conversation=conversation_text))
            return result.content
        except Exception as e:
            # Fallback to simple extraction if LLM fails
            return f"Discussion covered: {conversation_text[:200]}..."

    def delete_conversation(self, conversation_id: int, user_id: int, db: Session) -> bool:
        """Delete (deactivate) conversation."""
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        ).first()

        if conversation:
            conversation.is_active = False
            conversation.updated_at = datetime.utcnow()
            db.commit()
            return True
        return False

    def get_conversation_messages(
        self,
        conversation_id: int,
        user_id: int,
        db: Session,
        limit: int = 100
    ) -> List[Message]:
        """Get all messages for a conversation."""
        conversation = self.get_conversation(conversation_id, user_id, db)
        if not conversation:
            return []

        return db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.timestamp).limit(limit).all()


# Global conversation service instance
conversation_service = ConversationService()
