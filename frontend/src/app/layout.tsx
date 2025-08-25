import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Agentic RAG - Intelligent Knowledge Assistant',
    description: 'Advanced RAG system with intelligent routing, conversation memory, and multi-source knowledge retrieval.',
    keywords: 'AI, RAG, LLM, knowledge assistant, conversation AI',
    authors: [{ name: 'Agentic RAG Team' }],
    viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className={inter.className}>
                <Providers>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#ffffff',
                                color: '#374151',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                padding: '16px',
                                fontSize: '14px',
                                maxWidth: '400px',
                            },
                        }}
                    />
                </Providers>
            </body>
        </html>
    )
}
