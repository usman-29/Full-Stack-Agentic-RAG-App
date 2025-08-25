'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import {
    Brain,
    Search,
    MessageSquare,
    Sparkles,
    Database,
    Route,
    Zap,
    Shield
} from 'lucide-react'
import { useChatStore } from '@/store/chat'

export function WelcomeScreen() {
    const { sendMessage } = useChatStore()
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.welcome-item',
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: 'power3.out',
                    stagger: 0.1,
                    delay: 0.2
                }
            )

            gsap.fromTo('.suggestion-card',
                { opacity: 0, scale: 0.9, y: 20 },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.5,
                    ease: 'back.out(1.7)',
                    stagger: 0.1,
                    delay: 0.6
                }
            )
        }, containerRef)

        return () => ctx.revert()
    }, [])

    const features = [
        {
            icon: <Brain className="w-6 h-6" />,
            title: "Intelligent Routing",
            description: "Automatically finds the best source for your question",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: <MessageSquare className="w-6 h-6" />,
            title: "Conversation Memory",
            description: "Remembers context across our entire conversation",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: <Search className="w-6 h-6" />,
            title: "Multi-Source Search",
            description: "Combines knowledge base, web search, and AI reasoning",
            color: "from-green-500 to-emerald-500"
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Quality Assured",
            description: "Built-in fact-checking and response validation",
            color: "from-orange-500 to-red-500"
        }
    ]

    const suggestions = [
        {
            icon: <Brain className="w-5 h-5 text-blue-600" />,
            text: "What are LLM agents and how do they work?",
            category: "AI & ML"
        },
        {
            icon: <Database className="w-5 h-5 text-green-600" />,
            text: "Explain vector databases and embeddings",
            category: "Technical"
        },
        {
            icon: <Route className="w-5 h-5 text-purple-600" />,
            text: "How does RAG improve AI responses?",
            category: "Architecture"
        },
        {
            icon: <Zap className="w-5 h-5 text-orange-600" />,
            text: "What's new in AI research this week?",
            category: "Current"
        }
    ]

    const handleSuggestionClick = async (suggestion: string) => {
        try {
            await sendMessage(suggestion)
        } catch (error) {
            console.error('Failed to send suggestion:', error)
        }
    }

    return (
        <div ref={containerRef} className="max-w-4xl mx-auto">
            {/* Welcome Header */}
            <div className="text-center mb-12">
                <div className="welcome-item w-20 h-20 bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-10 h-10 text-white" />
                </div>

                <h1 className="welcome-item text-4xl font-bold gradient-text mb-4">
                    Welcome to Agentic RAG
                </h1>

                <p className="welcome-item text-xl text-secondary-600 max-w-2xl mx-auto leading-relaxed">
                    I'm your intelligent AI assistant with advanced reasoning capabilities.
                    I can search through knowledge bases, browse the web, and provide contextual responses.
                </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                {features.map((feature, index) => (
                    <div key={index} className="welcome-item card p-6 hover:shadow-lg transition-shadow duration-300">
                        <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                            {feature.icon}
                        </div>
                        <h3 className="font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                        <p className="text-secondary-600 text-sm">{feature.description}</p>
                    </div>
                ))}
            </div>

            {/* Suggestions */}
            <div className="mb-8">
                <h2 className="welcome-item text-xl font-semibold text-secondary-900 mb-6 text-center">
                    Try asking me about...
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion.text)}
                            className="suggestion-card group text-left p-4 bg-white border-2 border-secondary-200 hover:border-primary-300 rounded-xl transition-all duration-200 hover:shadow-md transform hover:scale-105"
                        >
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 p-2 bg-secondary-50 group-hover:bg-primary-50 rounded-lg transition-colors duration-200">
                                    {suggestion.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-medium text-secondary-500 mb-1">
                                        {suggestion.category}
                                    </div>
                                    <div className="text-secondary-900 font-medium group-hover:text-primary-700 transition-colors duration-200">
                                        {suggestion.text}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Call to Action */}
            <div className="welcome-item text-center">
                <p className="text-secondary-600 mb-4">
                    Start a conversation by typing your question below
                </p>
                <div className="flex items-center justify-center space-x-2 text-primary-600">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Powered by advanced AI with intelligent routing</span>
                </div>
            </div>
        </div>
    )
}
