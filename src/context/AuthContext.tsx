'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AuthContextType {
    user: User | null
    loading: boolean
    isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Firebase listener: se ejecuta en cada cambio de estado de auth
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            // #region agent log
            try {
                if (typeof fetch !== 'undefined') {
                    const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID
                    const hasAdminUid = typeof adminUid === 'string' && adminUid.length > 0
                    const isAdminNow = !!firebaseUser && firebaseUser.uid === adminUid

                    fetch('http://127.0.0.1:7708/ingest/40767566-b83b-4b8a-b4d9-1874f3e7c4c7', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8d1efa' },
                        body: JSON.stringify({
                            sessionId: '8d1efa',
                            runId: 'pre-fix',
                            hypothesisId: 'H2_firebase_user_or_admin_mismatch',
                            location: 'src/context/AuthContext.tsx:onAuthStateChanged',
                            message: 'firebase auth state changed',
                            data: {
                                hasFirebaseUser: !!firebaseUser,
                                hasAdminUid,
                                isAdminNow,
                            },
                            timestamp: Date.now(),
                        }),
                    }).catch(() => {})
                }
            } catch {}
            // #endregion

            setUser(firebaseUser)
            setLoading(false)
        })

        // Cleanup: cancela el listener al desmontar el componente
        return unsubscribe
    }, [])

    // Verificación doble: Firebase Auth + tu UID específico
    const isAdmin = user?.uid === process.env.NEXT_PUBLIC_ADMIN_UID

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => useContext(AuthContext)