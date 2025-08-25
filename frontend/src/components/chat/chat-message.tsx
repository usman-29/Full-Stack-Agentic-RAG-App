'use client'

import { useState } from 'react'
import { Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Message } from '@/store/chat'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ChatMessageProps {
    message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
    const [copied, setCopied] = useState(false)
    const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content)
            setCopied(true)
            toast.success('Copied to clipboard')
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast.error('Failed to copy')
        }
    }

    const handleFeedback = (type: 'up' | 'down') => {
        setFeedback(type)
        toast.success(type === 'up' ? 'Thanks for your feedback!' : 'Feedback noted')
    }

    const formatContent = (content: string) => {
        // Simple markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-secondary-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
            .replace(/\n/g, '<br>')
    }

    return (
        <div className={cn(
            'group relative',
            message.role === 'user' ? 'ml-12' : 'mr-12'
        )}>
            <div className={cn(
                'rounded-2xl px-4 py-3 shadow-sm',
                message.role === 'user'
                    ? 'bg-primary-500 text-white ml-auto'
                    : 'bg-white border border-secondary-200'
            )}>
                <div
                    className={cn(
                        'prose prose-sm max-w-none',
                        message.role === 'user'
                            ? 'prose-invert'
                            : 'prose-secondary'
                    )}
                    dangerouslySetInnerHTML={{
                        __html: formatContent(message.content)
                    }}
                />
            </div>

            {/* Message actions */}
            <div className={cn(
                'flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                message.role === 'user' ? 'justify-end' : 'justify-start'
            )}>
                {message.timestamp && (
                    <span className="text-xs text-secondary-500">
                        {formatDateTime(message.timestamp)}
                    </span>
                )}

                <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-secondary-100 rounded transition-colors duration-200"
                    title="Copy message"
                >
                    {copied ? (
                        <Check className="w-3 h-3 text-green-600" />
                    ) : (
                        <Copy className="w-3 h-3 text-secondary-500" />
                    )}
                </button>

                {/* Feedback buttons for assistant messages */}
                {message.role === 'assistant' && (
                    <>
                        <button
                            onClick={() => handleFeedback('up')}
                            className={cn(
                                'p-1 hover:bg-secondary-100 rounded transition-colors duration-200',
                                feedback === 'up' ? 'text-green-600' : 'text-secondary-500'
                            )}
                            title="Good response"
                        >
                            <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => handleFeedback('down')}
                            className={cn(
                                'p-1 hover:bg-secondary-100 rounded transition-colors duration-200',
                                feedback === 'down' ? 'text-red-600' : 'text-secondary-500'
                            )}
                            title="Poor response"
                        >
                            <ThumbsDown className="w-3 h-3" />
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
