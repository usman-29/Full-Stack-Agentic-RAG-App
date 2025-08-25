import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { api } from '@/lib/api'

export interface User {
    id: number
    email: string
    name: string
    picture?: string
    given_name?: string
    family_name?: string
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    checkAuth: () => Promise<void>
    login: (redirectUrl?: string) => Promise<void>
    logout: () => Promise<void>
    setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            checkAuth: async () => {
                try {
                    set({ isLoading: true })
                    const response = await api.get('/auth/verify')

                    if (response.data.authenticated) {
                        set({
                            user: response.data.user,
                            isAuthenticated: true
                        })
                    } else {
                        set({
                            user: null,
                            isAuthenticated: false
                        })
                    }
                } catch (error) {
                    set({
                        user: null,
                        isAuthenticated: false
                    })
                } finally {
                    set({ isLoading: false })
                }
            },

            login: async (redirectUrl?: string) => {
                try {
                    const response = await api.get('/auth/login')
                    const authUrl = response.data.authorization_url

                    // Store redirect URL in localStorage if provided
                    if (redirectUrl) {
                        localStorage.setItem('auth_redirect', redirectUrl)
                    }

                    // Redirect to Google OAuth
                    window.location.href = authUrl
                } catch (error) {
                    console.error('Login failed:', error)
                    throw error
                }
            },

            logout: async () => {
                try {
                    await api.post('/auth/logout')
                } catch (error) {
                    console.error('Logout error:', error)
                } finally {
                    // Clear local state regardless of API response
                    set({
                        user: null,
                        isAuthenticated: false
                    })

                    // Clear cookies
                    Cookies.remove('access_token')
                    Cookies.remove('refresh_token')

                    // Redirect to home
                    window.location.href = '/'
                }
            },

            setUser: (user: User) => {
                set({
                    user,
                    isAuthenticated: true
                })
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
)
