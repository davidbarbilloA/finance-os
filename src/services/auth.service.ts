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
        if (credential.user.uid !== process.env.NEXT_PUBLIC_ADMIN_UID) {
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