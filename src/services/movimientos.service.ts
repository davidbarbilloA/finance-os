import { createClient } from '@/lib/supabase/client'
import type { Movimiento, MovimientoInput } from '@/types/movimientos.types'

// Nombre de la tabla en Supabase
const TABLA = 'movimientos'

// Convierte snake_case de PostgreSQL → camelCase de TypeScript
function rowToMovimiento(row: Record<string, unknown>): Movimiento {
    return {
        id: row.id as string,
        titulo: row.titulo as string,
        descripcion: row.descripcion as string | undefined,
        monto: Number(row.monto),
        tipo: row.tipo as Movimiento['tipo'],
        categoria: row.categoria as Movimiento['categoria'],
        metodoPago: row.metodo_pago as Movimiento['metodoPago'],
        bolsillo: row.bolsillo as string | undefined,
        fecha: new Date(row.fecha as string),
        userId: row.user_id as string,
        createdAt: new Date(row.created_at as string),
        updatedAt: new Date(row.updated_at as string),
    }
}

// Convierte camelCase de TypeScript → snake_case para PostgreSQL
function movimientoToRow(input: Partial<MovimientoInput>) {
    return {
        ...(input.titulo !== undefined && { titulo: input.titulo }),
        ...(input.descripcion !== undefined && { descripcion: input.descripcion }),
        ...(input.monto !== undefined && { monto: input.monto }),
        ...(input.tipo !== undefined && { tipo: input.tipo }),
        ...(input.categoria !== undefined && { categoria: input.categoria }),
        ...(input.metodoPago !== undefined && { metodo_pago: input.metodoPago }),
        ...(input.bolsillo !== undefined && { bolsillo: input.bolsillo }),
        // Guardar solo la fecha (sin hora) en formato ISO YYYY-MM-DD
        ...(input.fecha !== undefined && {
            fecha: input.fecha.toISOString().split('T')[0],
        }),
    }
}

export class MovimientosService {

    // CREATE
    static async crear(input: MovimientoInput): Promise<string> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('No autenticado')

        const { data, error } = await supabase
            .from(TABLA)
            .insert({ ...movimientoToRow(input), user_id: user.id })
            .select('id')
            .single()

        if (error) throw error
        return data.id
    }

    // READ — con filtros opcionales
    static async obtenerTodos(filtros?: {
        tipo?: string
        categoria?: string
        busqueda?: string
        desde?: Date
        hasta?: Date
    }): Promise<Movimiento[]> {
        const supabase = createClient()

        let query = supabase
            .from(TABLA)
            .select('*')
            .order('fecha', { ascending: false })
            .order('created_at', { ascending: false })

        // Aplicar filtros opcionales
        if (filtros?.tipo) query = query.eq('tipo', filtros.tipo)
        if (filtros?.categoria) query = query.eq('categoria', filtros.categoria)
        if (filtros?.busqueda) query = query.ilike('titulo', `%${filtros.busqueda}%`)
        if (filtros?.desde) query = query.gte('fecha', filtros.desde.toISOString().split('T')[0])
        if (filtros?.hasta) query = query.lte('fecha', filtros.hasta.toISOString().split('T')[0])

        const { data, error } = await query

        if (error) throw error
        return (data ?? []).map(rowToMovimiento)
    }

    // READ para el mes actual (dashboard)
    static async obtenerDelMes(año: number, mes: number): Promise<Movimiento[]> {
        const supabase = createClient()
        const inicio = `${año}-${String(mes).padStart(2, '0')}-01`
        // Último día del mes
        const fin = new Date(año, mes, 0).toISOString().split('T')[0]

        const { data, error } = await supabase
            .from(TABLA)
            .select('*')
            .gte('fecha', inicio)
            .lte('fecha', fin)
            .order('fecha', { ascending: false })

        if (error) throw error
        return (data ?? []).map(rowToMovimiento)
    }

    // UPDATE
    static async actualizar(id: string, input: Partial<MovimientoInput>): Promise<void> {
        const supabase = createClient()

        const { error } = await supabase
            .from(TABLA)
            .update(movimientoToRow(input))
            .eq('id', id)

        if (error) throw error
    }

    // DELETE
    static async eliminar(id: string): Promise<void> {
        const supabase = createClient()

        const { error } = await supabase
            .from(TABLA)
            .delete()
            .eq('id', id)

        if (error) throw error
    }

    // REALTIME — suscripción a cambios en tiempo real
    // Equivalente al onSnapshot de Firestore
    static suscribir(callback: (movimientos: Movimiento[]) => void) {
        const supabase = createClient()

        const channel = supabase
            .channel('movimientos_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: TABLA },
                async () => {
                    // Al recibir cualquier cambio, recargamos todos los datos
                    const movimientos = await MovimientosService.obtenerTodos()
                    callback(movimientos)
                }
            )
            .subscribe()

        // Retorna función de cleanup (igual que Firebase)
        return () => {
            supabase.removeChannel(channel)
        }
    }
}