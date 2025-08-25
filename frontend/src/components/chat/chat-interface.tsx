'use client'

import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { Send, Bot, User, Sparkles, Route, Search, Brain } from 'lucide-react'
import { useChatStore } from '@/store/chat'
import { useAuthStore } from '@/store/auth'
import { ChatMessage } from './chat-message'
import { WelcomeScreen } from './welcome-screen'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export function ChatInterface() {
    const [input, setInput] = useState('')
    const [isComposing, setIsComposing] = useState(false)
    const {
        messages,
        currentConversation,
        isTyping,
        sendMessage
    } = useChatStore()
    const { user } = useAuthStore()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    useEffect(() => {
        // Auto-resize textarea
        if (inputRef.current) {
            inputRef.current.style.height = 'auto'
            inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
        }
    }, [input])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!input.trim() || isTyping) return

        const message = input.trim()
        setInput('')

        try {
            await sendMessage(message, currentConversation?.id)
        } catch (error) {
            toast.error('Failed to send message')
            setInput(message) // Restore input on error
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const getRouteIcon = (route: string) => {
        switch (route) {
            case 'vectorstore':
                return <Brain className="w-3 h-3" />
            case 'web_search':
                return <Search className="w-3 h-3" />
            case 'direct_llm':
                return <Sparkles className="w-3 h-3" />
            default:
                return <Route className="w-3 h-3" />
        }
    }

    const getRouteColor = (route: string) => {
        switch (route) {
            case 'vectorstore':
                return 'text-blue-600 bg-blue-50'
            case 'web_search':
                return 'text-green-600 bg-green-50'
            case 'direct_llm':
                return 'text-purple-600 bg-purple-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-secondary-200 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-secondary-900">
                            {currentConversation?.title || 'New Conversation'}
                        </h1>
                        <p className="text-sm text-secondary-600">
                            Intelligent AI assistant with context awareness
                        </p>
                    </div>

                    {messages.length > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-secondary-600">
                            <span>{messages.length} messages</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-6"
            >
                {messages.length === 0 ? (
                    <WelcomeScreen />
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={cn(
                                    'flex items-start space-x-4',
                                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                                )}
                            >
                                {/* Avatar */}
                                <div className={cn(
                                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                                    message.role === 'user'
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-secondary-200 text-secondary-600'
                                )}>
                                    {message.role === 'user' ? (
                                        user?.picture ? (
                                            <img
                                                src={user.picture}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <User className="w-4 h-4" />
                                        )
                                    ) : (
                                        <Bot className="w-4 h-4" />
                                    )}
                                </div>

                                {/* Message */}
                                <div className={cn(
                                    'flex-1 max-w-3xl',
                                    message.role === 'user' ? 'text-right' : ''
                                )}>
                                    <ChatMessage message={message} />

                                    {/* Route indicator for assistant messages */}
                                    {message.role === 'assistant' && message.route_taken && (
                                        <div className="mt-2 flex items-center space-x-2">
                                            <div className={cn(
                                                'inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full',
                                                getRouteColor(message.route_taken)
                                            )}>
                                                {getRouteIcon(message.route_taken)}
                                                <span className="capitalize">
                                                    {message.route_taken.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-200 text-secondary-600 flex items-center justify-center">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="inline-block bg-white border border-secondary-200 rounded-2xl px-4 py-3">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-secondary-200 bg-white p-6">
                <form onSubmit={handleSubmit} className="flex items-end space-x-4">
                    <div className="flex-1">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            placeholder="Ask me anything..."
                            rows={1}
                            className="w-full resize-none rounded-xl border border-secondary-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 max-h-32"
                            style={{ minHeight: '48px' }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className={cn(
                            'flex-shrink-0 p-3 rounded-xl transition-all duration-200',
                            input.trim() && !isTyping
                                ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                : 'bg-secondary-200 text-secondary-400 cursor-not-allowed'
                        )}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>

                <div className="mt-2 text-xs text-secondary-500 text-center">
                    Press Enter to send, Shift+Enter for new line
                </div>
            </div>
        </div>
    )
}
