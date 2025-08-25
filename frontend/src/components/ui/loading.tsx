'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
    size?: 'sm' | 'md' | 'lg'
    text?: string
    className?: string
}

export function Loading({ size = 'md', text, className }: LoadingProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    }

    return (
        <div className={cn('flex items-center justify-center space-x-2', className)}>
            <Loader2 className={cn('animate-spin text-primary-600', sizeClasses[size])} />
            {text && <span className="text-secondary-600 text-sm">{text}</span>}
        </div>
    )
}

export function PageLoading() {
    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center">
            <div className="card max-w-sm mx-auto text-center">
                <Loading size="lg" text="Loading..." />
            </div>
        </div>
    )
}
