import { createClient } from '@/lib/supabase/client'
import type { AuthError } from '@supabase/supabase-js'

export class AuthService {

    static async login(email: string, password: string) {
        const supabase = createClient()

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw error

        // Capa extra de seguridad: verificar que sea el admin autorizado
        if (data.user.id !== process.env.NEXT_PUBLIC_ADMIN_USER_ID) {
            await supabase.auth.signOut()
            throw new Error('Acceso denegado: usuario no autorizado')
        }

        return data.user
    }

    static async logout() {
        const supabase = createClient()
        await supabase.auth.signOut()
    }

    static async getSession() {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        return session
    }

    static async getUser() {
        const supabase = createClient()
        // getUser() hace una llamada al servidor para validar el JWT — más seguro que getSession()
        const { data: { user } } = await supabase.auth.getUser()
        return user
    }

    // Traducción de errores de Supabase Auth al español
    static getErrorMessage(error: AuthError | Error): string {
        if ('status' in error) {
            const messages: Record<string, string> = {
                'Invalid login credentials': 'Email o contraseña incorrectos',
                'Email not confirmed': 'Confirma tu email antes de ingresar',
                'Too many requests': 'Demasiados intentos. Espera unos minutos',
                'User not found': 'No existe una cuenta con ese email',
            }
            return messages[error.message] ?? error.message
        }
        return error.message
    }
}