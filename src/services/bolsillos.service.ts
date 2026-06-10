import { createClient } from '@/lib/supabase/client'
import type { BolsilloInfo } from '@/types/movimientos.types'

const TABLA = 'bolsillos'

// Helper for local storage key
const getLocalKey = (userId: string) => `finance-os:bolsillos:${userId}`

export class BolsillosService {

    static async obtenerTodos(): Promise<BolsilloInfo[]> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        try {
            const { data, error } = await supabase
                .from(TABLA)
                .select('*')
                .order('created_at', { ascending: true })

            if (error) throw error
            return (data ?? []).map(row => ({
                id: row.id,
                nombre: row.nombre,
                color: row.color,
                montoObjetivo: row.monto_objetivo ? Number(row.monto_objetivo) : undefined,
                userId: row.user_id,
                createdAt: new Date(row.created_at)
            }))
        } catch (err) {
            console.warn('Fallando a localStorage para bolsillos:', err)
            // Fallback to localStorage
            const key = getLocalKey(user.id)
            const localData = localStorage.getItem(key)
            if (localData) {
                try {
                    const parsed = JSON.parse(localData) as BolsilloInfo[]
                    return parsed.map(b => ({ ...b, createdAt: new Date(b.createdAt) }))
                } catch {
                    return []
                }
            }
            return []
        }
    }

    static async crear(nombre: string, color: string, montoObjetivo?: number): Promise<string> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('No autenticado')

        const tempId = Math.random().toString(36).substring(2, 11)

        try {
            const { data, error } = await supabase
                .from(TABLA)
                .insert({
                    nombre,
                    color,
                    monto_objetivo: montoObjetivo,
                    user_id: user.id
                })
                .select('id')
                .single()

            if (error) throw error
            return data.id
        } catch (err) {
            console.warn('Guardando bolsillo en localStorage:', err)
            const key = getLocalKey(user.id)
            const actuales = await this.obtenerTodos()
            const nuevo: BolsilloInfo = {
                id: tempId,
                nombre,
                color,
                montoObjetivo,
                userId: user.id,
                createdAt: new Date()
            }
            localStorage.setItem(key, JSON.stringify([...actuales, nuevo]))
            return tempId
        }
    }

    static async eliminar(id: string): Promise<void> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        try {
            const { error } = await supabase
                .from(TABLA)
                .delete()
                .eq('id', id)

            if (error) throw error
        } catch (err) {
            console.warn('Eliminando bolsillo de localStorage:', err)
            const key = getLocalKey(user.id)
            const actuales = await this.obtenerTodos()
            const filtrados = actuales.filter(b => b.id !== id)
            localStorage.setItem(key, JSON.stringify(filtrados))
        }
    }
}
