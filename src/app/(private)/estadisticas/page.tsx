'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useMovimientos } from '@/hooks/useMovimientos'

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4']

function formatMoney(value: unknown) {
    const amount = typeof value === 'number' ? value : Number(value ?? 0)
    return `$${amount.toLocaleString('es-CO')}`
}

export default function EstadisticasPage() {
    const { movimientos, loading } = useMovimientos()

    const data = useMemo(() => {
        const porTipo = movimientos.reduce<Record<string, number>>((acc, m) => {
            acc[m.tipo] = (acc[m.tipo] ?? 0) + m.monto
            return acc
        }, {})

        const porBolsillo = movimientos.reduce<Record<string, number>>((acc, m) => {
            const key = m.bolsillo ?? 'general'
            acc[key] = (acc[key] ?? 0) + m.monto
            return acc
        }, {})

        const porMes = movimientos.reduce<Record<string, number>>((acc, m) => {
            const key = format(m.fecha, 'MMM yy', { locale: es })
            acc[key] = (acc[key] ?? 0) + (m.tipo === 'ingreso' ? m.monto : -m.monto)
            return acc
        }, {})

        return {
            porTipo: Object.entries(porTipo).map(([name, value]) => ({ name, value })),
            porBolsillo: Object.entries(porBolsillo).map(([name, value]) => ({ name, value })),
            porMes: Object.entries(porMes).map(([mes, balance]) => ({ mes, balance })),
        }
    }, [movimientos])

    if (loading) {
        return <div className="h-40 rounded-xl bg-gray-900 animate-pulse" />
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Estadisticas</h1>
                <p className="text-sm text-gray-500 mt-0.5">Analiza tu comportamiento financiero por tipo y bolsillo</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <section className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Distribucion por tipo</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.porTipo}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ background: '#111827', border: '1px solid #1f2937', color: '#fff' }}
                                    formatter={(value) => [formatMoney(value), 'Monto']}
                                />
                                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <section className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Participacion por bolsillo</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data.porBolsillo} dataKey="value" nameKey="name" outerRadius={95} label>
                                    {data.porBolsillo.map((entry, index) => (
                                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#111827', border: '1px solid #1f2937', color: '#fff' }}
                                    formatter={(value) => [formatMoney(value), 'Monto']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </div>

            <section className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Balance por mes</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.porMes}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                            <XAxis dataKey="mes" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{ background: '#111827', border: '1px solid #1f2937', color: '#fff' }}
                                formatter={(value) => [formatMoney(value), 'Balance']}
                            />
                            <Bar dataKey="balance" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    )
}
