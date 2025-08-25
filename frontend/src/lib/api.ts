import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
    baseURL: `${API_URL}/api/v1`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                // Try to refresh token
                await api.post('/auth/refresh')
                return api(originalRequest)
            } catch (refreshError) {
                // Refresh failed, redirect to login
                window.location.href = '/auth/login'
                return Promise.reject(refreshError)
            }
        }

        // Show error toast for other errors
        if (error.response?.status >= 400) {
            const message = error.response?.data?.detail || 'An error occurred'
            toast.error(message)
        }

        return Promise.reject(error)
    }
)

export default api
