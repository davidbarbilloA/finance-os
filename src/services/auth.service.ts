import {
    signInWithEmailAndPassword,
    signOut,
    AuthError
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

export class AuthService {

    // Login — lanza error si el UID no coincide con el admin
    static async login(email: string, password: string) {
        const credential = await signInWithEmailAndPassword(auth, email, password)

        // Capa extra de seguridad en el cliente
        const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID
        const isAllowed = credential.user.uid === adminUid

        // #region agent log
        try {
            if (typeof fetch !== 'undefined') {
                fetch('http://127.0.0.1:7708/ingest/40767566-b83b-4b8a-b4d9-1874f3e7c4c7', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8d1efa' },
                    body: JSON.stringify({
                        sessionId: '8d1efa',
                        runId: 'pre-fix',
                        hypothesisId: 'H3_admin_uid_missing_or_wrong',
                        location: 'src/services/auth.service.ts:login',
                        message: 'admin uid check result',
                        data: {
                            hasAdminUid: typeof adminUid === 'string' && adminUid.length > 0,
                            isAllowed,
                        },
                        timestamp: Date.now(),
                    }),
                }).catch(() => {})
            }
        } catch {}
        // #endregion

        if (!isAllowed) {
            // #region agent log
            try {
                if (typeof fetch !== 'undefined') {
                    fetch('http://127.0.0.1:7708/ingest/40767566-b83b-4b8a-b4d9-1874f3e7c4c7', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8d1efa' },
                        body: JSON.stringify({
                            sessionId: '8d1efa',
                            runId: 'pre-fix',
                            hypothesisId: 'H3_admin_uid_missing_or_wrong',
                            location: 'src/services/auth.service.ts:login-access-denied',
                            message: 'signOut because admin uid mismatch',
                            data: {},
                            timestamp: Date.now(),
                        }),
                    }).catch(() => {})
                }
            } catch {}
            // #endregion
            await signOut(auth)
            throw new Error('Acceso denegado: usuario no autorizado')
        }

        return credential.user
    }

    static async logout() {
        await signOut(auth)
    }

    // Traduce errores de Firebase a mensajes amigables en español
    static getErrorMessage(error: AuthError): string {
        const messages: Record<string, string> = {
            'auth/invalid-credential': 'Email o contraseña incorrectos',
            'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
            'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos',
            'auth/network-request-failed': 'Error de conexión. Revisa tu internet',
        }
        return messages[error.code] ?? 'Error desconocido. Intenta de nuevo'
    }
}