'use client'

import { useState, useEffect, useCallback } from 'react'
import { BolsillosService } from '@/services/bolsillos.service'
import { useAuthContext } from '@/context/AuthContext'
import type { BolsilloInfo } from '@/types/movimientos.types'
import toast from 'react-hot-toast'

export function useBolsillos() {
    const { user, loading: authLoading } = useAuthContext()
    const [bolsillos, setBolsillos] = useState<BolsilloInfo[]>([])
    const [loading, setLoading] = useState(true)

    const cargar = useCallback(async () => {
        if (authLoading || !user) return
        setLoading(true)
        try {
            const data = await BolsillosService.obtenerTodos()
            setBolsillos(data)
        } catch {
            toast.error('Error al cargar los bolsillos')
        } finally {
            setLoading(false)
        }
    }, [user, authLoading])

    useEffect(() => {
        cargar()
    }, [cargar])

    const crearBolsillo = useCallback(async (nombre: string, color: string, montoObjetivo?: number) => {
        try {
            await BolsillosService.crear(nombre, color, montoObjetivo)
            toast.success('Bolsillo creado ✓')
            await cargar()
        } catch {
            toast.error('Error al crear el bolsillo')
        }
    }, [cargar])

    const eliminarBolsillo = useCallback(async (id: string) => {
        try {
            await BolsillosService.eliminar(id)
            toast.success('Bolsillo eliminado')
            await cargar()
        } catch {
            toast.error('Error al eliminar el bolsillo')
        }
    }, [cargar])

    return { bolsillos, loading, crearBolsillo, eliminarBolsillo, recargar: cargar }
}
