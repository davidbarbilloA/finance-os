'use client'

import { useAuthContext } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function PrivateGuard({ children }: { children: React.ReactNode }) {
    const { user, loading, isAdmin } = useAuthContext()
    const router = useRouter()

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.replace('/login')
        }
    }, [user, loading, isAdmin, router])

    // Pantalla de carga mientras Firebase verifica la sesión
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    <p className="text-sm text-gray-400">Verificando acceso...</p>
                </div>
            </div>
        )
    }

    if (!user || !isAdmin) return null

    return <>{children}</>
}