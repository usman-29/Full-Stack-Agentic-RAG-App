'use client'

import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import {
    Plus,
    MessageSquare,
    MoreVertical,
    Trash2,
    Edit2,
    Calendar,
    Search,
    X
} from 'lucide-react'
import { useChatStore } from '@/store/chat'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export function ConversationSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
    const {
        conversations,
        currentConversation,
        isLoading,
        createConversation,
        deleteConversation,
        loadConversation,
        clearCurrentConversation,
        setCurrentConversation
    } = useChatStore()

    const sidebarRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (!isCollapsed) {
                gsap.fromTo('.conversation-item',
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.3,
                        ease: 'power2.out',
                        stagger: 0.05
                    }
                )
            }
        }, sidebarRef)

        return () => ctx.revert()
    }, [conversations, isCollapsed])

    const filteredConversations = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleNewConversation = async () => {
        try {
            clearCurrentConversation()
            toast.success('Started new conversation')
        } catch (error) {
            toast.error('Failed to create conversation')
        }
    }

    const handleDeleteConversation = async (conversationId: number) => {
        try {
            await deleteConversation(conversationId)
            toast.success('Conversation deleted')
        } catch (error) {
            toast.error('Failed to delete conversation')
        }
        setActiveDropdown(null)
    }

    const handleLoadConversation = async (conversationId: number) => {
        try {
            await loadConversation(conversationId)
        } catch (error) {
            toast.error('Failed to load conversation')
        }
    }

    const groupConversationsByDate = (conversations: any[]) => {
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        const groups = {
            today: [] as any[],
            yesterday: [] as any[],
            thisWeek: [] as any[],
            older: [] as any[]
        }

        conversations.forEach(conv => {
            const convDate = new Date(conv.updated_at)
            const diffDays = Math.floor((today.getTime() - convDate.getTime()) / (1000 * 60 * 60 * 24))

            if (diffDays === 0) {
                groups.today.push(conv)
            } else if (diffDays === 1) {
                groups.yesterday.push(conv)
            } else if (diffDays <= 7) {
                groups.thisWeek.push(conv)
            } else {
                groups.older.push(conv)
            }
        })

        return groups
    }

    const groupedConversations = groupConversationsByDate(filteredConversations)

    const ConversationGroup = ({ title, conversations }: { title: string, conversations: any[] }) => {
        if (conversations.length === 0) return null

        return (
            <div className="mb-6">
                <h3 className="text-xs font-medium text-secondary-500 uppercase tracking-wider mb-3 px-3">
                    {title}
                </h3>
                <div className="space-y-1">
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={cn(
                                'conversation-item group relative mx-2 rounded-lg transition-all duration-200',
                                currentConversation?.id === conv.id
                                    ? 'bg-primary-100 border border-primary-200'
                                    : 'hover:bg-secondary-100'
                            )}
                        >
                            <button
                                onClick={() => handleLoadConversation(conv.id)}
                                className="w-full text-left p-3 flex items-center space-x-3"
                            >
                                <MessageSquare className={cn(
                                    'w-4 h-4 flex-shrink-0',
                                    currentConversation?.id === conv.id
                                        ? 'text-primary-600'
                                        : 'text-secondary-500'
                                )} />
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        'text-sm font-medium truncate',
                                        currentConversation?.id === conv.id
                                            ? 'text-primary-900'
                                            : 'text-secondary-900'
                                    )}>
                                        {conv.title}
                                    </p>
                                    <p className="text-xs text-secondary-500">
                                        {conv.message_count} messages • {formatDateTime(conv.updated_at)}
                                    </p>
                                </div>
                            </button>

                            {/* Options dropdown */}
                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setActiveDropdown(activeDropdown === conv.id ? null : conv.id)
                                    }}
                                    className="p-1 hover:bg-secondary-200 rounded transition-colors duration-200"
                                >
                                    <MoreVertical className="w-4 h-4 text-secondary-600" />
                                </button>

                                {activeDropdown === conv.id && (
                                    <div className="absolute right-0 top-8 w-48 bg-white border border-secondary-200 rounded-lg shadow-lg py-1 z-10">
                                        <button
                                            onClick={() => setActiveDropdown(null)}
                                            className="w-full text-left px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors duration-200 flex items-center space-x-2"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            <span>Rename</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteConversation(conv.id)}
                                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <>
            <div
                ref={sidebarRef}
                className={cn(
                    'bg-white border-r border-secondary-200 transition-all duration-300 flex flex-col',
                    isCollapsed ? 'w-16' : 'w-80'
                )}
            >
                {/* Header */}
                <div className="p-4 border-b border-secondary-200">
                    {!isCollapsed && (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-secondary-900">Conversations</h2>
                                <button
                                    onClick={() => setIsCollapsed(true)}
                                    className="p-1 hover:bg-secondary-100 rounded transition-colors duration-200 md:hidden"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <button
                                onClick={handleNewConversation}
                                className="w-full btn-primary flex items-center justify-center space-x-2 mb-4"
                            >
                                <Plus className="w-4 h-4" />
                                <span>New Chat</span>
                            </button>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                        </>
                    )}

                    {isCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-secondary-100 rounded transition-colors duration-200"
                        >
                            <MessageSquare className="w-5 h-5 text-secondary-600" />
                        </button>
                    )}
                </div>

                {/* Conversations List */}
                {!isCollapsed && (
                    <div className="flex-1 overflow-y-auto py-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="text-center py-8 px-4">
                                <MessageSquare className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                                <p className="text-secondary-600 mb-2">
                                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                                </p>
                                <p className="text-sm text-secondary-500">
                                    {searchQuery ? 'Try different search terms' : 'Start a new conversation to get started'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <ConversationGroup title="Today" conversations={groupedConversations.today} />
                                <ConversationGroup title="Yesterday" conversations={groupedConversations.yesterday} />
                                <ConversationGroup title="This Week" conversations={groupedConversations.thisWeek} />
                                <ConversationGroup title="Older" conversations={groupedConversations.older} />
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Click outside to close dropdown */}
            {activeDropdown && (
                <div
                    className="fixed inset-0 z-5"
                    onClick={() => setActiveDropdown(null)}
                />
            )}
        </>
    )
}
