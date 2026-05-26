'use client'

import { useAuthContext } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function PrivateGuard({ children }: { children: React.ReactNode }) {
    const { user, loading, isAdmin } = useAuthContext()
    const router = useRouter()

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            // #region agent log
            try {
                if (typeof fetch !== 'undefined') {
                    fetch('http://127.0.0.1:7708/ingest/40767566-b83b-4b8a-b4d9-1874f3e7c4c7', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8d1efa' },
                        body: JSON.stringify({
                            sessionId: '8d1efa',
                            runId: 'pre-fix',
                            hypothesisId: 'H4_private_guard_redirect_loop',
                            location: 'src/components/layout/PrivateGuard.tsx:redirect',
                            message: 'redirecting to /login from PrivateGuard',
                            data: {
                                hasUser: !!user,
                                isAdmin,
                                loading,
                            },
                            timestamp: Date.now(),
                        }),
                    }).catch(() => {})
                }
            } catch {}
            // #endregion
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