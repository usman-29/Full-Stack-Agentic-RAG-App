'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { gsap } from 'gsap'
import {
    Brain,
    Menu,
    X,
    User,
    LogOut,
    MessageSquare,
    Settings,
    ChevronDown
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

interface NavbarProps {
    className?: string
}

export function Navbar({ className }: NavbarProps) {
    const { isAuthenticated, user, logout } = useAuthStore()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const mobileMenuRef = useRef<HTMLDivElement>(null)
    const profileMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isMenuOpen && mobileMenuRef.current) {
            gsap.fromTo(mobileMenuRef.current,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
            )
        }
    }, [isMenuOpen])

    useEffect(() => {
        if (isProfileOpen && profileMenuRef.current) {
            gsap.fromTo(profileMenuRef.current,
                { opacity: 0, y: -10, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'power2.out' }
            )
        }
    }, [isProfileOpen])

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <nav className={cn('fixed top-0 w-full z-50 glass', className)}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text">Agentic RAG</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {isAuthenticated ? (
                            <>
                                <Link href="/chat" className="btn-ghost flex items-center space-x-2">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Chat</span>
                                </Link>

                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center space-x-2 btn-ghost"
                                    >
                                        {user?.picture ? (
                                            <Image
                                                src={user.picture}
                                                alt={user.name}
                                                width={24}
                                                height={24}
                                                className="rounded-full"
                                            />
                                        ) : (
                                            <User className="w-4 h-4" />
                                        )}
                                        <span className="max-w-32 truncate">{user?.name}</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>

                                    {isProfileOpen && (
                                        <div
                                            ref={profileMenuRef}
                                            className="absolute right-0 mt-2 w-48 card py-2 shadow-xl"
                                        >
                                            <div className="px-4 py-2 border-b border-secondary-200">
                                                <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                                                <p className="text-xs text-secondary-600 truncate">{user?.email}</p>
                                            </div>
                                            <Link
                                                href="/profile"
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                                            >
                                                <Settings className="w-4 h-4" />
                                                <span>Settings</span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Sign out</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="#features" className="btn-ghost">Features</Link>
                                <Link href="/auth/login" className="btn-primary">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden btn-ghost p-2"
                    >
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div ref={mobileMenuRef} className="md:hidden py-4 border-t border-secondary-200">
                        <div className="space-y-2">
                            {isAuthenticated ? (
                                <>
                                    <div className="px-4 py-2 border-b border-secondary-200 mb-2">
                                        <div className="flex items-center space-x-3">
                                            {user?.picture ? (
                                                <Image
                                                    src={user.picture}
                                                    alt={user.name}
                                                    width={32}
                                                    height={32}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-secondary-900">{user?.name}</p>
                                                <p className="text-sm text-secondary-600">{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        href="/chat"
                                        className="block px-4 py-2 text-secondary-700 hover:bg-secondary-50 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Chat
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="block px-4 py-2 text-secondary-700 hover:bg-secondary-50 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Settings
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout()
                                            setIsMenuOpen(false)
                                        }}
                                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Sign out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="#features"
                                        className="block px-4 py-2 text-secondary-700 hover:bg-secondary-50 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Features
                                    </Link>
                                    <Link
                                        href="/auth/login"
                                        className="block px-4 py-2 text-primary-600 font-medium hover:bg-primary-50 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Click outside to close dropdowns */}
            {(isMenuOpen || isProfileOpen) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setIsMenuOpen(false)
                        setIsProfileOpen(false)
                    }}
                />
            )}
        </nav>
    )
}
