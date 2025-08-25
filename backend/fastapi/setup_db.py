"""Database setup script for conversation memory system."""

import os
import sys
from sqlalchemy import create_engine, text

# Add the current directory to Python path
sys.path.append(os.path.dirname(__file__))

from database.connection import DATABASE_URL, create_tables
from database.models import Base


def setup_database():
    """Set up the database and create all tables."""
    try:
        print("Setting up database...")
        print(f"Database URL: {DATABASE_URL}")
        
        # Create tables
        create_tables()
        print("✅ Database tables created successfully!")
        
        # Verify tables exist
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            tables = [row[0] for row in result]
            
        print(f"✅ Tables created: {', '.join(tables)}")
        
        if 'users' in tables:
            print("✅ User authentication ready")
        if 'conversations' in tables:
            print("✅ Conversation memory ready")
        if 'messages' in tables:
            print("✅ Message storage ready")
        if 'conversation_summaries' in tables:
            print("✅ Summary buffer ready")
            
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        print("\nMake sure:")
        print("1. PostgreSQL is running")
        print("2. Database 'agentic_rag' exists")
        print("3. DATABASE_URL is correct in .env")
        return False
    
    return True


if __name__ == "__main__":
    setup_database()
