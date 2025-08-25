# Agentic RAG Frontend

A beautiful, modern Next.js frontend for the Agentic RAG system with intelligent conversation capabilities.

## Features

- 🎨 **Beautiful UI** with Tailwind CSS and custom gradients
- 🎬 **Smooth Animations** powered by GSAP
- 🔐 **Google OAuth Authentication** with JWT tokens
- 💬 **Real-time Chat Interface** with conversation memory
- 📱 **Responsive Design** for all devices
- ⚡ **Lightning Fast** with Next.js 14 and App Router
- 🎯 **TypeScript** for type safety

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- The Agentic RAG backend running on http://localhost:8000

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                 # Next.js 13+ App Router
│   ├── auth/           # Authentication pages
│   ├── chat/           # Chat interface
│   └── layout.tsx      # Root layout
├── components/         # React components
│   ├── chat/          # Chat-related components
│   └── ui/            # Reusable UI components
├── lib/               # Utilities and API
├── store/             # Zustand state management
└── types/             # TypeScript type definitions
```

## Key Components

### Chat Interface
- **ChatInterface**: Main chat component with message handling
- **ConversationSidebar**: Conversation history and management
- **ChatMessage**: Individual message display with actions
- **WelcomeScreen**: Onboarding and feature showcase

### Authentication
- **Google OAuth Integration**: Secure authentication flow
- **JWT Token Management**: Automatic token refresh
- **Protected Routes**: Auth-required pages

### State Management
- **Auth Store**: User authentication state
- **Chat Store**: Conversation and message management
- **API Integration**: Axios-based API client with interceptors

## Styling

The app uses a cohesive design system:

- **Colors**: Primary (blue), Secondary (gray), Accent (purple)
- **Typography**: Inter font family with proper hierarchy
- **Components**: Reusable button, card, and form styles
- **Animations**: GSAP-powered smooth transitions

## API Integration

The frontend integrates with the Agentic RAG backend:

- **Authentication**: `/api/v1/auth/*`
- **Chat**: `/api/v1/chat/*`
- **Conversations**: `/api/v1/conversations/*`
- **Documents**: `/api/v1/documents/*`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- Component-based architecture

## Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

3. **Environment Variables:**
   Ensure `NEXT_PUBLIC_API_URL` points to your production backend.

## Features Overview

### Home Page
- Animated landing page with project explanation
- Feature showcase with interactive elements
- Call-to-action sections

### Authentication
- Google OAuth integration
- Secure JWT token management
- Protected route handling

### Chat Interface
- Real-time messaging with the AI
- Conversation memory and context
- Message actions (copy, feedback)
- Route indicators (vectorstore, web search, direct LLM)

### Conversation Management
- Conversation history sidebar
- Search and filter conversations
- Create, rename, and delete conversations
- Date-based grouping

The frontend provides a complete, production-ready interface for the Agentic RAG system!
