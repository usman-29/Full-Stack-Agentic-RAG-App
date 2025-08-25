'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'

export function Providers({ children }: { children: React.ReactNode }) {
    const { checkAuth } = useAuthStore()

    useEffect(() => {
        // Check authentication status on app load
        checkAuth()
    }, [checkAuth])

    return <>{children}</>
}
