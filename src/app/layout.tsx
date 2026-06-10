import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
    title: 'FinanceOS — Gestión Personal',
    description: 'Plataforma privada de finanzas personales',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es" className="dark">
            <body className="font-sans bg-gray-950 antialiased">
                <AuthProvider>
                    {children}
                    <Toaster
                        position="top-center"
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