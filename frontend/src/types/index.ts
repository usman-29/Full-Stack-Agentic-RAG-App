export interface User {
    id: number
    email: string
    name: string
    picture?: string
    given_name?: string
    family_name?: string
    locale?: string
    is_active: boolean
    created_at?: string
    updated_at?: string
    last_login?: string
}

export interface Message {
    id?: number
    role: 'user' | 'assistant'
    content: string
    route_taken?: 'vectorstore' | 'web_search' | 'direct_llm'
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

export interface ApiResponse<T = any> {
    data: T
    message?: string
    status?: string
}

export interface ChatResponse {
    question: string
    answer: string
    route_taken: string
    conversation_id: number
    documents_used?: string[]
    processing_info?: {
        use_web_search: boolean
        documents_count: number
        context_used: boolean
        [key: string]: any
    }
}

export interface DocumentUploadResponse {
    message: string
    documents_added: number
    duplicates_filtered: number
    total_documents_processed: number
}
