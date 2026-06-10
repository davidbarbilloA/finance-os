'use client'

import { useState, useEffect, useCallback } from 'react'
import { MovimientosService } from '@/services/movimientos.service'
import { useAuthContext } from '@/context/AuthContext'
import type { Movimiento, MovimientoInput } from '@/types/movimientos.types'
import toast from 'react-hot-toast'

export function useMovimientos() {
    const { user, loading: authLoading } = useAuthContext()
    const [movimientos, setMovimientos] = useState<Movimiento[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Cargar datos iniciales + suscripción realtime
    useEffect(() => {
        // Esperar a que la autenticación esté lista
        if (authLoading || !user) return

        setLoading(true)

        // Carga inicial
        MovimientosService.obtenerTodos()
            .then((data) => {
                setMovimientos(data)
                setLoading(false)
            })
            .catch((err) => {
                setError(err instanceof Error ? err.message : 'Error al cargar los movimientos')
                setLoading(false)
            })

        // Suscripción a cambios en tiempo real
        const unsubscribe = MovimientosService.suscribir((data) => {
            setMovimientos(data)
        })

        return unsubscribe
    }, [user, authLoading])

    const crear = useCallback(async (input: MovimientoInput) => {
        try {
            await MovimientosService.crear(input)
            toast.success('Movimiento registrado ✓')
        } catch {
            toast.error('Error al guardar el movimiento')
        }
    }, [])

    const actualizar = useCallback(async (id: string, input: Partial<MovimientoInput>) => {
        try {
            await MovimientosService.actualizar(id, input)
            toast.success('Movimiento actualizado ✓')
        } catch {
            toast.error('Error al actualizar')
        }
    }, [])

    const eliminar = useCallback(async (id: string) => {
        try {
            await MovimientosService.eliminar(id)
            toast.success('Movimiento eliminado')
        } catch {
            toast.error('Error al eliminar')
        }
    }, [])

    return { movimientos, loading, error, crear, actualizar, eliminar }
}