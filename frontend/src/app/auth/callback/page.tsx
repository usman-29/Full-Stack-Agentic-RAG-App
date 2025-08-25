'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { gsap } from 'gsap'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'

export default function AuthCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { checkAuth } = useAuthStore()
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.callback-content',
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }
            )
        }, containerRef)

        return () => ctx.revert()
    }, [])

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code')
            const error = searchParams.get('error')

            if (error) {
                toast.error('Authentication failed')
                setTimeout(() => router.push('/auth/login'), 2000)
                return
            }

            if (code) {
                try {
                    // Check auth status after OAuth callback
                    await checkAuth()

                    // Get redirect URL from localStorage
                    const redirectUrl = localStorage.getItem('auth_redirect') || '/chat'
                    localStorage.removeItem('auth_redirect')

                    toast.success('Successfully signed in!')
                    setTimeout(() => router.push(redirectUrl), 1500)
                } catch (error) {
                    console.error('Auth callback error:', error)
                    toast.error('Authentication failed')
                    setTimeout(() => router.push('/auth/login'), 2000)
                }
            } else {
                toast.error('No authorization code received')
                setTimeout(() => router.push('/auth/login'), 2000)
            }
        }

        handleCallback()
    }, [searchParams, router, checkAuth])

    const error = searchParams.get('error')

    return (
        <div ref={containerRef} className="min-h-screen gradient-bg flex items-center justify-center p-4">
            <div className="callback-content card max-w-md mx-auto text-center">
                {error ? (
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-secondary-900">
                            Authentication Failed
                        </h2>
                        <p className="text-secondary-600">
                            There was an error signing you in. Please try again.
                        </p>
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                            Error: {error}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-secondary-900">
                            Authentication Successful
                        </h2>
                        <p className="text-secondary-600">
                            You've been successfully signed in. Redirecting to your dashboard...
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-primary-600">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Redirecting...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
