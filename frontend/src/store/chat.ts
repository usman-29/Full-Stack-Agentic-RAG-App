import { create } from 'zustand'
import { api } from '@/lib/api'

export interface Message {
    id?: number
    role: 'user' | 'assistant'
    content: string
    route_taken?: string
    timestamp?: string
}

export interface Conversation {
    id: number
    title: string
    is_active: boolean
    created_at: string
    updated_at: string
    message_count: number
}

interface ChatState {
    currentConversation: Conversation | null
    messages: Message[]
    conversations: Conversation[]
    isLoading: boolean
    isTyping: boolean

    // Actions
    sendMessage: (message: string, conversationId?: number) => Promise<void>
    loadConversations: () => Promise<void>
    loadConversation: (conversationId: number) => Promise<void>
    createConversation: (title: string) => Promise<Conversation>
    deleteConversation: (conversationId: number) => Promise<void>
    clearCurrentConversation: () => void
    setCurrentConversation: (conversation: Conversation | null) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
    currentConversation: null,
    messages: [],
    conversations: [],
    isLoading: false,
    isTyping: false,

    sendMessage: async (message: string, conversationId?: number) => {
        const { currentConversation } = get()

        try {
            set({ isTyping: true })

            // Add user message to UI immediately
            const userMessage: Message = {
                role: 'user',
                content: message,
                timestamp: new Date().toISOString(),
            }

            set(state => ({
                messages: [...state.messages, userMessage]
            }))

            // Send to API
            const response = await api.post('/chat/ask', {
                question: message,
                conversation_id: conversationId || currentConversation?.id,
            })

            const { answer, route_taken, conversation_id } = response.data

            // Add assistant message
            const assistantMessage: Message = {
                role: 'assistant',
                content: answer,
                route_taken,
                timestamp: new Date().toISOString(),
            }

            set(state => ({
                messages: [...state.messages, assistantMessage]
            }))

            // Update current conversation if we got a new conversation_id
            if (conversation_id && !currentConversation) {
                // Load the new conversation details
                const convResponse = await api.get(`/conversations/${conversation_id}`)
                set({ currentConversation: convResponse.data.conversation })
            }

        } catch (error) {
            console.error('Failed to send message:', error)
            throw error
        } finally {
            set({ isTyping: false })
        }
    },

    loadConversations: async () => {
        try {
            set({ isLoading: true })
            const response = await api.get('/conversations')
            set({ conversations: response.data.conversations })
        } catch (error) {
            console.error('Failed to load conversations:', error)
        } finally {
            set({ isLoading: false })
        }
    },

    loadConversation: async (conversationId: number) => {
        try {
            set({ isLoading: true })
            const response = await api.get(`/conversations/${conversationId}`)
            const { conversation, messages } = response.data

            set({
                currentConversation: conversation,
                messages: messages,
            })
        } catch (error) {
            console.error('Failed to load conversation:', error)
        } finally {
            set({ isLoading: false })
        }
    },

    createConversation: async (title: string) => {
        try {
            const response = await api.post('/conversations', { title })
            const newConversation = response.data

            set(state => ({
                conversations: [newConversation, ...state.conversations],
                currentConversation: newConversation,
                messages: [],
            }))

            return newConversation
        } catch (error) {
            console.error('Failed to create conversation:', error)
            throw error
        }
    },

    deleteConversation: async (conversationId: number) => {
        try {
            await api.delete(`/conversations/${conversationId}`)

            set(state => ({
                conversations: state.conversations.filter(c => c.id !== conversationId),
                currentConversation:
                    state.currentConversation?.id === conversationId ? null : state.currentConversation,
                messages:
                    state.currentConversation?.id === conversationId ? [] : state.messages,
            }))
        } catch (error) {
            console.error('Failed to delete conversation:', error)
            throw error
        }
    },

    clearCurrentConversation: () => {
        set({
            currentConversation: null,
            messages: [],
        })
    },

    setCurrentConversation: (conversation: Conversation | null) => {
        set({
            currentConversation: conversation,
            messages: [],
        })
    },
}))
