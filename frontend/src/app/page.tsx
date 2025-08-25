'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
    Brain,
    MessageSquare,
    Search,
    Zap,
    Shield,
    Users,
    ArrowRight,
    Sparkles,
    Database,
    Route,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Navbar } from '@/components/ui/navbar'

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
    const { isAuthenticated, user } = useAuthStore()
    const heroRef = useRef<HTMLDivElement>(null)
    const featuresRef = useRef<HTMLDivElement>(null)
    const statsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero animations
            gsap.fromTo('.hero-title',
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
            )

            gsap.fromTo('.hero-subtitle',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' }
            )

            gsap.fromTo('.hero-buttons',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, delay: 0.4, ease: 'power3.out' }
            )

            // Feature cards animation
            gsap.fromTo('.feature-card',
                { opacity: 0, y: 50, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                    stagger: 0.1,
                    scrollTrigger: {
                        trigger: '.features-grid',
                        start: 'top 80%',
                        end: 'bottom 20%',
                    }
                }
            )

            // Stats animation
            gsap.fromTo('.stat-item',
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    ease: 'back.out(1.7)',
                    stagger: 0.1,
                    scrollTrigger: {
                        trigger: '.stats-grid',
                        start: 'top 80%',
                    }
                }
            )

            // Floating animation for icons
            gsap.to('.float-icon', {
                y: -10,
                duration: 2,
                ease: 'power2.inOut',
                yoyo: true,
                repeat: -1,
                stagger: 0.3
            })

        }, heroRef)

        return () => ctx.revert()
    }, [])

    const features = [
        {
            icon: <Brain className="w-8 h-8" />,
            title: "Intelligent Routing",
            description: "Automatically routes questions to the best knowledge source - vector database, web search, or direct AI response.",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: <MessageSquare className="w-8 h-8" />,
            title: "Conversation Memory",
            description: "Maintains context across conversations with smart summarization and buffer management for natural interactions.",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: <Search className="w-8 h-8" />,
            title: "Multi-Source Retrieval",
            description: "Combines vector database search, real-time web search, and document grading for comprehensive answers.",
            color: "from-green-500 to-emerald-500"
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Quality Control",
            description: "Built-in hallucination detection and answer grading ensures accurate, trustworthy responses.",
            color: "from-orange-500 to-red-500"
        },
        {
            icon: <Database className="w-8 h-8" />,
            title: "Smart Document Management",
            description: "Advanced document processing with deduplication, chunking, and multi-vector retrieval strategies.",
            color: "from-indigo-500 to-purple-500"
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "User Authentication",
            description: "Secure Google OAuth integration with JWT tokens and personalized conversation history.",
            color: "from-pink-500 to-rose-500"
        }
    ]

    const stats = [
        { label: "Response Accuracy", value: "99.2%", icon: <Zap /> },
        { label: "Query Processing", value: "<2s", icon: <Route /> },
        { label: "Knowledge Sources", value: "3+", icon: <Database /> },
        { label: "Active Routes", value: "Smart", icon: <Brain /> },
    ]

    return (
        <div ref={heroRef} className="min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 gradient-bg min-h-screen flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6">
                            Intelligent
                            <span className="gradient-text block">Knowledge Assistant</span>
                        </h1>

                        <p className="hero-subtitle text-xl md:text-2xl text-secondary-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Advanced RAG system with intelligent routing, conversation memory, and multi-source knowledge retrieval.
                            Experience the future of AI-powered information discovery.
                        </p>

                        <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                            {isAuthenticated ? (
                                <Link href="/chat" className="btn-primary flex items-center space-x-2 text-lg px-8 py-4">
                                    <MessageSquare className="w-5 h-5" />
                                    <span>Start Chatting</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            ) : (
                                <Link href="/auth/login" className="btn-primary flex items-center space-x-2 text-lg px-8 py-4">
                                    <Sparkles className="w-5 h-5" />
                                    <span>Get Started Free</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            )}
                            <Link href="#demo" className="btn-secondary flex items-center space-x-2 text-lg px-8 py-4">
                                <span>Watch Demo</span>
                            </Link>
                        </div>
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="float-icon absolute top-1/4 left-1/4 text-primary-400 opacity-20">
                            <Brain className="w-16 h-16" />
                        </div>
                        <div className="float-icon absolute top-1/3 right-1/4 text-accent-400 opacity-20">
                            <Search className="w-12 h-12" />
                        </div>
                        <div className="float-icon absolute bottom-1/3 left-1/6 text-purple-400 opacity-20">
                            <MessageSquare className="w-14 h-14" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section ref={statsRef} className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-item text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary-600">
                                    {stat.icon}
                                </div>
                                <div className="text-3xl font-bold text-secondary-900 mb-2">{stat.value}</div>
                                <div className="text-secondary-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" ref={featuresRef} className="py-20 gradient-bg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Powerful <span className="gradient-text">Features</span>
                        </h2>
                        <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                            Built with cutting-edge AI technologies to deliver intelligent, contextual, and reliable responses.
                        </p>
                    </div>

                    <div className="features-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card card hover:scale-105 transition-transform duration-300">
                                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white mb-6`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-4 text-secondary-900">{feature.title}</h3>
                                <p className="text-secondary-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Experience the Future?
                    </h2>
                    <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                        Join thousands of users who are already leveraging intelligent AI for better knowledge discovery.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                        {isAuthenticated ? (
                            <Link href="/chat" className="bg-white text-primary-600 hover:bg-gray-50 font-semibold px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2">
                                <MessageSquare className="w-5 h-5" />
                                <span>Start Chatting Now</span>
                            </Link>
                        ) : (
                            <Link href="/auth/login" className="bg-white text-primary-600 hover:bg-gray-50 font-semibold px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2">
                                <Sparkles className="w-5 h-5" />
                                <span>Get Started Free</span>
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-secondary-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">Agentic RAG</span>
                        </div>
                        <div className="text-secondary-400">
                            © 2024 Agentic RAG. Intelligent knowledge at your fingertips.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
