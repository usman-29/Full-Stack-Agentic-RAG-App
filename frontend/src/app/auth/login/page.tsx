'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { Brain, Chrome, Shield, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'

export default function LoginPage() {
    const router = useRouter()
    const { login, isAuthenticated, isLoading } = useAuthStore()
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/chat')
        }
    }, [isAuthenticated, router])

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.login-card',
                { opacity: 0, y: 50, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
            )

            gsap.fromTo('.feature-item',
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.6,
                    ease: 'power2.out',
                    stagger: 0.1,
                    delay: 0.3
                }
            )
        }, containerRef)

        return () => ctx.revert()
    }, [])

    const handleGoogleLogin = async () => {
        try {
            await login(window.location.origin + '/chat')
        } catch (error) {
            toast.error('Failed to initiate login')
        }
    }

    const features = [
        {
            icon: <Brain className="w-5 h-5" />,
            title: "Intelligent Responses",
            description: "AI-powered answers with context awareness"
        },
        {
            icon: <Shield className="w-5 h-5" />,
            title: "Secure & Private",
            description: "Your conversations are encrypted and private"
        },
        {
            icon: <Zap className="w-5 h-5" />,
            title: "Lightning Fast",
            description: "Get answers in seconds, not minutes"
        }
    ]

    return (
        <div ref={containerRef} className="min-h-screen gradient-bg flex items-center justify-center p-4">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">

                {/* Left Side - Features */}
                <div className="hidden lg:block space-y-8">
                    <div>
                        <Link href="/" className="inline-flex items-center text-secondary-600 hover:text-secondary-900 transition-colors mb-8">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>

                        <h1 className="text-4xl font-bold text-secondary-900 mb-4">
                            Welcome to
                            <span className="gradient-text block">Agentic RAG</span>
                        </h1>
                        <p className="text-xl text-secondary-600 mb-8">
                            Experience intelligent conversations with advanced AI that understands context and provides accurate, helpful responses.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-item flex items-start space-x-4">
                                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 flex-shrink-0">
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-secondary-900 mb-1">{feature.title}</h3>
                                    <p className="text-secondary-600">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Login Card */}
                <div className="w-full max-w-md mx-auto">
                    <div className="login-card card text-center">
                        {/* Logo */}
                        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Brain className="w-8 h-8 text-white" />
                        </div>

                        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                            Sign in to continue
                        </h2>
                        <p className="text-secondary-600 mb-8">
                            Access your conversations and unlock personalized AI assistance
                        </p>

                        {/* Google Sign In Button */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full bg-white border-2 border-secondary-200 hover:border-secondary-300 text-secondary-700 font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <Chrome className="w-5 h-5 text-red-500" />
                            <span>
                                {isLoading ? 'Signing in...' : 'Continue with Google'}
                            </span>
                        </button>

                        <div className="mt-6 text-sm text-secondary-500">
                            By signing in, you agree to our{' '}
                            <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                                Terms of Service
                            </Link>
                            {' '}and{' '}
                            <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Features */}
                    <div className="lg:hidden mt-8 space-y-4">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-item flex items-center space-x-3 p-4 bg-white/50 rounded-lg">
                                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="font-medium text-secondary-900">{feature.title}</h3>
                                    <p className="text-sm text-secondary-600">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
