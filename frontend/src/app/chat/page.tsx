'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { useAuthStore } from '@/store/auth'
import { useChatStore } from '@/store/chat'
import { Navbar } from '@/components/ui/navbar'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ConversationSidebar } from '@/components/chat/conversation-sidebar'
import { PageLoading } from '@/components/ui/loading'

export default function ChatPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading } = useAuthStore()
    const { loadConversations } = useChatStore()
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login')
        }
    }, [isAuthenticated, authLoading, router])

    useEffect(() => {
        if (isAuthenticated) {
            loadConversations()
        }
    }, [isAuthenticated, loadConversations])

    useEffect(() => {
        if (isAuthenticated) {
            const ctx = gsap.context(() => {
                gsap.fromTo('.chat-container',
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
                )
            }, containerRef)

            return () => ctx.revert()
        }
    }, [isAuthenticated])

    if (authLoading) {
        return <PageLoading />
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div ref={containerRef} className="h-screen flex flex-col bg-secondary-50">
            <Navbar />

            <div className="flex-1 flex pt-16 overflow-hidden">
                {/* Sidebar */}
                <ConversationSidebar />

                {/* Main Chat Area */}
                <div className="flex-1 chat-container">
                    <ChatInterface />
                </div>
            </div>
        </div>
    )
}
