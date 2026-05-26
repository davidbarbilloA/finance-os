'use client'

import { useState, useEffect, useCallback } from 'react'
import { MovimientosService } from '@/services/movimientos.service'
import { useAuthContext } from '@/context/AuthContext'
import type { Movimiento, MovimientoInput } from '@/types/movimientos.types'
import toast from 'react-hot-toast'

export function useMovimientos() {
    const { user } = useAuthContext()
    const [movimientos, setMovimientos] = useState<Movimiento[] | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Suscripción en tiempo real al cargar
    useEffect(() => {
        if (!user) return

        // #region agent log
        try {
            if (typeof fetch !== 'undefined') {
                fetch('http://127.0.0.1:7708/ingest/40767566-b83b-4b8a-b4d9-1874f3e7c4c7', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8d1efa' },
                    body: JSON.stringify({
                        sessionId: '8d1efa',
                        runId: 'firestore-permission-debug',
                        hypothesisId: 'H10_firestore_rules_deny',
                        location: 'src/hooks/useMovimientos.ts:useEffect',
                        message: 'starting movimientos realtime subscription',
                        data: { hasUser: !!user, userUid: user.uid },
                        timestamp: 0,
                    }),
                }).catch(() => {})
            }
        } catch {}
        // #endregion

        const unsubscribe = MovimientosService.suscribir(
            user.uid,
            (data) => {
                setMovimientos(data)
                setError(null)
            },
            (err) => {
                setMovimientos([])
                const message = err.message ?? 'Error al cargar movimientos'
                setError(message)
                if (err.code === 'permission-denied') {
                    toast.error('Firestore sin permisos. Actualiza las reglas de seguridad.')
                } else {
                    toast.error('No se pudieron cargar los movimientos')
                }
            }
        )

        return unsubscribe // cleanup automático
    }, [user])

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

    const loading = !!user && movimientos === null

    return { movimientos: movimientos ?? [], loading, error, crear, actualizar, eliminar }
}