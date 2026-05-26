'use client'

import { useMemo } from 'react'
import { useMovimientos } from '@/hooks/useMovimientos'
import { TrendingUp, TrendingDown, PiggyBank, AlertCircle } from 'lucide-react'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'

function StatCard({
    label, value, icon: Icon, color, trend
}: {
    label: string
    value: number
    icon: React.ElementType
    color: 'emerald' | 'red' | 'blue' | 'amber'
    trend?: number
}) {
    const colorMap = {
        emerald: 'text-emerald-400 bg-emerald-400/10',
        red: 'text-red-400 bg-red-400/10',
        blue: 'text-blue-400 bg-blue-400/10',
        amber: 'text-amber-400 bg-amber-400/10',
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${colorMap[color]}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <p className="text-2xl font-bold text-white">
                ${value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
        </div>
    )
}

export default function DashboardPage() {
    const { movimientos, loading } = useMovimientos()

    // Calcular resumen del mes actual
    const resumen = useMemo(() => {
        const ahora = new Date()
        const inicio = startOfMonth(ahora)
        const fin = endOfMonth(ahora)

        const delMes = movimientos.filter(m =>
            isWithinInterval(m.fecha, { start: inicio, end: fin })
        )

        return {
            ingresos: delMes.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0),
            gastos: delMes.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0),
            ahorros: delMes.filter(m => m.tipo === 'ahorro').reduce((s, m) => s + m.monto, 0),
            deudas: delMes.filter(m => m.tipo === 'deuda').reduce((s, m) => s + m.monto, 0),
            recientes: movimientos.slice(0, 5),
        }
    }, [movimientos])

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-900 rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-white">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    {format(new Date(), "MMMM yyyy", { locale: es })}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Ingresos del mes" value={resumen.ingresos} icon={TrendingUp} color="emerald" />
                <StatCard label="Gastos del mes" value={resumen.gastos} icon={TrendingDown} color="red" />
                <StatCard label="Ahorros" value={resumen.ahorros} icon={PiggyBank} color="blue" />
                <StatCard label="Deudas pendientes" value={resumen.deudas} icon={AlertCircle} color="amber" />
            </div>

            {/* Balance */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/5 border border-emerald-500/20 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-1">Balance del mes</p>
                <p className={`text-4xl font-bold ${resumen.ingresos - resumen.gastos >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${(resumen.ingresos - resumen.gastos).toLocaleString('es-CO')}
                </p>
            </div>

            {/* Movimientos recientes */}
            <div>
                <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                    Últimos movimientos
                </h2>
                <div className="space-y-2">
                    {resumen.recientes.length === 0 ? (
                        <p className="text-gray-600 text-sm text-center py-8">
                            Sin movimientos registrados
                        </p>
                    ) : (
                        resumen.recientes.map(m => (
                            <div key={m.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-white">{m.titulo}</p>
                                    <p className="text-xs text-gray-500">
                                        {m.categoria} · {format(m.fecha, 'd MMM', { locale: es })}
                                    </p>
                                </div>
                                <span className={`text-sm font-semibold ${m.tipo === 'ingreso' ? 'text-emerald-400' :
                                    m.tipo === 'gasto' ? 'text-red-400' :
                                        m.tipo === 'ahorro' ? 'text-blue-400' : 'text-amber-400'
                                    }`}>
                                    {m.tipo === 'ingreso' ? '+' : '-'}${m.monto.toLocaleString('es-CO')}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}