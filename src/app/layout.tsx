import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'FinanceOS — Gestión Personal',
    description: 'Plataforma privada de finanzas personales',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es" className="dark">
            <body className={`${inter.className} bg-gray-950 antialiased`}>
                <AuthProvider>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: '#111827',
                                color: '#fff',
                                border: '1px solid #1f2937',
                                fontSize: '14px',
                            },
                        }}
                    />
                </AuthProvider>
            </body>
        </html>
    )
}