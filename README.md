# 🧠 Full Stack Agentic RAG - Intelligent Knowledge Assistant

<div align="center">

![Agentic RAG](https://img.shields.io/badge/Agentic%20RAG-Intelligent%20AI-blue?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11+-green?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-red?style=for-the-badge&logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=for-the-badge&logo=typescript)

*Advanced RAG system with intelligent routing, conversation memory, and multi-source knowledge retrieval*

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-agentic-rag-system) • [🎯 Features](#-key-features) • [🔧 API Reference](#-api-reference)

</div>

---

## 🎯 Overview

**Full Stack Agentic RAG** is a sophisticated Retrieval-Augmented Generation system that combines the power of Large Language Models with intelligent document retrieval, real-time web search, and conversation memory. Unlike traditional RAG systems, it features **intelligent routing** that automatically determines the best knowledge source for each question and includes **quality control mechanisms** to ensure accurate, trustworthy responses.

## 🧠 Agentic RAG System

### What Makes It "Agentic"?

Our RAG system is **agentic** because it makes intelligent decisions about how to process each query:

```mermaid
graph TD
    A[User Question] --> B[🤖 Intelligent Router]
    B --> C[📚 Vector Database]
    B --> D[🌐 Web Search]  
    B --> E[💬 Direct LLM]
    
    C --> F[📊 Document Grading]
    F --> G{Quality Check}
    G -->|Good| H[✨ Answer Generation]
    G -->|Poor| D
    
    D --> H
    E --> H
    H --> I[🛡️ Hallucination Detection]
    I --> J{Grounded?}
    J -->|Yes| K[✅ Final Answer]
    J -->|No| L[🔄 Regenerate]
    L --> H
```

### 🔄 Intelligent Routing Strategy

The system automatically routes questions to the optimal knowledge source:

1. **📚 Vector Database Route**
   - For ML/AI topics (agents, prompt engineering, adversarial attacks)
   - Uses MultiVectorRetriever with duplicate detection
   - Grades document relevance before generation

2. **🌐 Web Search Route**
   - For current events, factual queries, out-of-domain topics
   - Integrates Tavily search API
   - Combines web results with local knowledge

3. **💬 Direct LLM Route**
   - For greetings, small talk, simple math, general conversation
   - No external retrieval needed
   - Faster response for basic queries

### 🧠 Conversation Memory System

**Summary Buffer Memory** maintains context across conversations:

- **Recent Messages**: Keeps last 6 messages in full detail
- **Smart Summarization**: Automatically summarizes older messages using LLM
- **Context Injection**: Enhances prompts with conversation history
- **Per-User Isolation**: Each user has separate conversation threads

### 🛡️ Quality Control Pipeline

**Dual-Layer Validation** ensures response accuracy:

1. **Hallucination Grader**: Verifies answers are grounded in source documents
2. **Answer Grader**: Ensures responses actually address the user's question
3. **Self-Correction**: Automatically retries or searches web when quality fails

---

## 🎯 Key Features

### 🤖 **Advanced AI Capabilities**
- **Multi-Source Intelligence**: Combines vector search, web search, and direct reasoning
- **Context Awareness**: Maintains conversation history with smart summarization
- **Quality Assurance**: Built-in fact-checking and response validation
- **Intelligent Routing**: Automatically selects optimal knowledge source

### 🔐 **Enterprise Authentication**
- **Google OAuth2 Integration**: Secure authentication flow
- **JWT Token Management**: Stateless authentication with refresh tokens
- **User Isolation**: Personalized conversations and document access
- **Session Management**: HTTP-only cookies for security

### 📚 **Smart Document Management**
- **MultiVectorRetriever**: Advanced retrieval with document chunking
- **Duplicate Detection**: Content-based deduplication using SHA256 hashing
- **Format Support**: Text files with automatic processing
- **Real-time Upload**: API endpoints for document ingestion

### 💬 **Conversation Management**
- **Thread Organization**: Multiple conversations per user
- **Search & Filter**: Find conversations by content
- **Auto-Titling**: Intelligent conversation naming
- **Export Capability**: Full conversation history access

---

## 🏗️ Architecture

### Backend Stack
- **🐍 Python 3.11+** with FastAPI framework
- **🤖 LangChain + LangGraph** for AI orchestration
- **🗄️ PostgreSQL** for user data and conversations
- **🔍 ChromaDB** for vector storage and retrieval
- **🔐 JWT + OAuth2** for authentication
- **🐳 Docker** for database containerization

### Frontend Stack
- **⚛️ Next.js 14** with App Router
- **📘 TypeScript** for type safety
- **🎨 Tailwind CSS** for styling
- **✨ GSAP** for animations
- **🔄 Zustand** for state management
- **📡 Axios** for API communication

### AI & Search Integration
- **🧠 OpenAI GPT Models** for language understanding
- **🔍 Tavily Search API** for real-time web search
- **📊 Embeddings** for semantic document retrieval
- **🤖 LangChain Tools** for AI orchestration

---

## 🔧 API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/v1/auth/login` | Get Google OAuth URL | ❌ |
| `GET` | `/api/v1/auth/callback` | Handle OAuth callback | ❌ |
| `POST` | `/api/v1/auth/refresh` | Refresh access token | ❌ |
| `POST` | `/api/v1/auth/logout` | Logout user | ✅ |
| `GET` | `/api/v1/auth/me` | Get user profile | ✅ |
| `GET` | `/api/v1/auth/verify` | Check auth status | ❌ |

### Chat & Conversations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/v1/chat/ask` | Send message with memory | 🔶 Optional |
| `POST` | `/api/v1/chat/ask-anonymous` | Send message without memory | ❌ |
| `GET` | `/api/v1/chat/routes` | Get routing information | ❌ |
| `POST` | `/api/v1/conversations` | Create new conversation | ✅ |
| `GET` | `/api/v1/conversations` | List user conversations | ✅ |
| `GET` | `/api/v1/conversations/{id}` | Get conversation history | ✅ |
| `DELETE` | `/api/v1/conversations/{id}` | Delete conversation | ✅ |

### Document Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/v1/documents/upload` | Upload by file paths | ✅ |
| `POST` | `/api/v1/documents/upload-files` | Upload files directly | ✅ |
| `GET` | `/api/v1/documents/stats` | Get system statistics | ✅ |

### Example API Usage

#### Send a Message
```bash
curl -X POST "http://localhost:8000/api/v1/chat/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are LLM agents?",
    "conversation_id": 123
  }'
```

#### Response Format
```json
{
  "question": "What are LLM agents?",
  "answer": "LLM agents are AI systems that can...",
  "route_taken": "vectorstore",
  "conversation_id": 123,
  "documents_used": ["Document excerpt..."],
  "processing_info": {
    "use_web_search": false,
    "documents_count": 3,
    "context_used": true
  }
}
```

---

## 🎨 Frontend Application

### Beautiful, Modern Interface
- **🎨 Gradient Design**: Beautiful blue/purple theme with smooth animations
- **📱 Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **✨ GSAP Animations**: Smooth page transitions and interactive elements
- **🎯 Intuitive UX**: Clean, user-friendly interface design

### Key Pages & Features
- **🏠 Landing Page**: Animated hero section with feature showcase
- **🔐 Authentication**: Google OAuth login with animated onboarding
- **💬 Chat Interface**: Real-time messaging with conversation sidebar
- **📋 Conversation Management**: Search, organize, and manage chat history
- **⚙️ User Profile**: Account settings and preferences

### Chat Experience
- **💭 Real-time Messaging**: Instant responses with typing indicators
- **🧠 Context Awareness**: Conversations remember previous exchanges
- **🏷️ Route Visualization**: See how AI processed your question
- **📋 Message Actions**: Copy, feedback, and interaction options
- **🎯 Smart Suggestions**: Quick-start prompts for new users

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** and pip
- **Node.js 18+** and npm
- **PostgreSQL 15+**
- **API Keys**: OpenAI, Tavily, Google OAuth2

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/agentic-rag.git
cd agentic-rag
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend/

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp env.example .env
# Edit .env with your API keys and database credentials

# Start PostgreSQL with Docker
docker-compose up -d

# Initialize database
cd fastapi/
python setup_db.py

# Start FastAPI server
python run.py
```

**Backend will be running at:** `http://localhost:8000`

### 3. Frontend Setup

```bash
# Navigate to frontend (in new terminal)
cd frontend/

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local: NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm run dev
```

**Frontend will be running at:** `http://localhost:3000`

### 4. Configure API Keys

Edit `backend/.env` with your credentials:

```bash
# Required API Keys
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...

# Database (if not using Docker defaults)
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/agentic_rag
```

### 5. Test the System

1. **Visit** `http://localhost:3000`
2. **Sign in** with Google OAuth
3. **Start chatting** with the AI assistant
4. **Upload documents** via the API or UI
5. **Explore** conversation memory and routing

---

## 📚 Documentation

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key for LLM | ✅ | - |
| `TAVILY_API_KEY` | Tavily search API key | ✅ | - |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | ✅ | - |
| `DATABASE_URL` | PostgreSQL connection | ✅ | localhost |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token lifetime | ❌ | 30 |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime | ❌ | 7 |

### Project Structure

```
agentic-rag/
├── backend/                 # Python FastAPI backend
│   ├── agentic_rag/        # Core RAG system
│   │   ├── graph/          # LangGraph workflow
│   │   ├── chains/         # LLM chains
│   │   ├── nodes/          # Graph nodes
│   │   └── ingestion.py    # Document processing
│   ├── fastapi/            # Web API
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication
│   │   ├── database/       # Database models
│   │   └── services/       # Business logic
│   └── docker-compose.yml  # PostgreSQL setup
├── frontend/               # Next.js frontend
│   ├── src/app/           # App Router pages
│   ├── src/components/    # React components
│   ├── src/lib/           # Utilities
│   └── src/store/         # State management
└── README.md              # This file
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **LangChain** for the excellent AI framework
- **FastAPI** for the high-performance web framework
- **Next.js** for the amazing React framework
- **OpenAI** for GPT models
- **Tavily** for web search capabilities

---

## 📞 Support

- **🐛 Issues**: [GitHub Issues](https://github.com/usman-29/Full-Stack-Agentic-RAG-App/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/usman-29/Full-Stack-Agentic-RAG-App/discussions)
- **📧 Email**: suusaeed749@gmail.com

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by the Agentic RAG Team

</div>

