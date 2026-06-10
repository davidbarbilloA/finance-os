'use client'

import { useState, useEffect, useMemo } from 'react'
import { useMovimientos } from '@/hooks/useMovimientos'
import { useBolsillos } from '@/hooks/useBolsillos'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import {
    TrendingUp, TrendingDown, PiggyBank, CreditCard, Award, AlertTriangle, Lightbulb,
    Calendar, CheckCircle, PieChart as PieIcon, BarChart3, LineChart as LineIcon
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

const CATEGORIAS = [
    { value: 'hogar', label: 'Hogar' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'comida', label: 'Comida' },
    { value: 'entretenimiento', label: 'Entretenimiento' },
    { value: 'suscripciones', label: 'Suscripciones' },
    { value: 'deudas', label: 'Deudas' },
    { value: 'ahorro', label: 'Ahorro' },
    { value: 'salud', label: 'Salud' },
    { value: 'mascota', label: 'Mascota' },
    { value: 'trabajo', label: 'Trabajo' },
    { value: 'educacion', label: 'Educación' },
    { value: 'otro', label: 'Otro' },
]

const METODOS_PAGO = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta_debito', label: 'Tarjeta de Débito' },
    { value: 'tarjeta_credito', label: 'Tarjeta de Crédito' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'otro', label: 'Otro' },
]

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1']

export default function EstadisticasPage() {
    const { movimientos, loading: loadMov } = useMovimientos()
    const { bolsillos, loading: loadBol } = useBolsillos()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Monthly values calculation
    const metrics = useMemo(() => {
        const ingresos = movimientos.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0)
        const gastos = movimientos.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0)
        const ahorros = movimientos.filter(m => m.tipo === 'ahorro').reduce((s, m) => s + m.monto, 0)
        
        const savingsRate = ingresos > 0 ? Math.round((ahorros / ingresos) * 100) : 0
        const burnRate = ingresos > 0 ? Math.round((gastos / ingresos) * 100) : 0
        
        // Find largest expense category
        const expenseCats: Record<string, number> = {}
        movimientos.filter(m => m.tipo === 'gasto').forEach(m => {
            expenseCats[m.categoria] = (expenseCats[m.categoria] || 0) + m.monto
        })
        const largestCatEntry = Object.entries(expenseCats).sort((a, b) => b[1] - a[1])[0]
        const largestCat = largestCatEntry 
            ? `${CATEGORIAS.find(c => c.value === largestCatEntry[0])?.label || largestCatEntry[0]} ($${largestCatEntry[1].toLocaleString('es-CO')})`
            : 'Ninguna'

        // Daily average spending
        const daysInMonth = new Date().getDate()
        const dailyAverage = daysInMonth > 0 ? Math.round(gastos / daysInMonth) : 0

        return { ingresos, gastos, savingsRate, burnRate, largestCat, dailyAverage }
    }, [movimientos])

    // Category distribution chart data
    const categoryData = useMemo(() => {
        const dataMap: Record<string, number> = {}
        movimientos.filter(m => m.tipo === 'gasto').forEach(m => {
            dataMap[m.categoria] = (dataMap[m.categoria] || 0) + m.monto
        })
        return Object.entries(dataMap)
            .map(([name, value]) => ({
                name: CATEGORIAS.find(c => c.value === name)?.label || name,
                monto: value
            }))
            .sort((a, b) => b.monto - a.monto)
    }, [movimientos])

    // Payment methods data
    const paymentData = useMemo(() => {
        const dataMap: Record<string, number> = {}
        movimientos.filter(m => m.tipo === 'gasto').forEach(m => {
            dataMap[m.metodoPago] = (dataMap[m.metodoPago] || 0) + m.monto
        })
        return Object.entries(dataMap).map(([name, value]) => ({
            name: METODOS_PAGO.find(m => m.value === name)?.label || name,
            value
        }))
    }, [movimientos])

    // Line trend chart data (Last 30 days)
    const trendData = useMemo(() => {
        const dates = Array.from({ length: 15 }).map((_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - i)
            return d
        }).reverse()

        return dates.map(date => {
            const dayMovs = movimientos.filter(m => isSameDay(new Date(m.fecha), date))
            const ingresos = dayMovs.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0)
            const gastos = dayMovs.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0)
            return {
                name: format(date, 'd MMM', { locale: es }),
                Ingresos: ingresos,
                Gastos: gastos
            }
        })
    }, [movimientos])

    // Dynamic financial insights generator
    const insights = useMemo(() => {
        const list = []
        if (metrics.savingsRate < 10) {
            list.push({
                type: 'warning',
                icon: AlertTriangle,
                title: 'Tasa de ahorro baja',
                text: 'Tu tasa de ahorro mensual está por debajo del 10%. Intenta separar al menos un 10-20% de tus ingresos a principio de mes en tus bolsillos de ahorro.',
                color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            })
        } else {
            list.push({
                type: 'success',
                icon: Award,
                title: '¡Buen ritmo de ahorro!',
                text: `Estás ahorrando el ${metrics.savingsRate}% de tus ingresos. Sigue así para construir tu fondo de emergencia de forma estable.`,
                color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            })
        }

        if (metrics.burnRate > 80) {
            list.push({
                type: 'danger',
                icon: AlertTriangle,
                title: 'Gastos elevados',
                text: `Estás consumiendo el ${metrics.burnRate}% de tus ingresos totales. Te sugerimos revisar las categorías de entretenimiento y suscripciones para recortar gastos hormiga.`,
                color: 'text-red-400 bg-red-500/10 border-red-500/20'
            })
        }

        if (categoryData.length > 0 && categoryData[0].monto > metrics.ingresos * 0.4) {
            list.push({
                type: 'info',
                icon: Lightbulb,
                title: 'Concentración de gasto',
                text: `Tu mayor gasto está concentrado en "${categoryData[0].name}". Representa más del 40% de tus ingresos. Considera presupuestar un límite mensual para esta categoría.`,
                color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
            })
        }

        if (list.length === 0) {
            list.push({
                type: 'info',
                icon: Lightbulb,
                title: 'Ecosistema Financiero Saludable',
                text: 'Registra de manera constante tus gastos diarios y asócialos a tus bolsillos para generar análisis más detallados de tus hábitos financieros.',
                color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            })
        }
        return list
    }, [metrics, categoryData])

    if (loadMov || loadBol) {
        return (
            <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                <p className="text-gray-400 text-sm">Calculando estadísticas y métricas...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            
            {/* Header */}
            <div className="border-b border-gray-800 pb-5">
                <h1 className="text-2xl font-black text-white">Análisis & Estadísticas</h1>
                <p className="text-xs text-gray-500 mt-1">Reporte visual detallado de tus consumos y hábitos de ahorro</p>
            </div>

            {/* Top metrics grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Savings Rate Card */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
                        <span>Tasa de Ahorro</span>
                        <PiggyBank className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-black text-white">{metrics.savingsRate}%</p>
                        <p className="text-[10px] text-gray-500">De tus ingresos son destinados al ahorro</p>
                    </div>
                </div>

                {/* Burn Rate Card */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
                        <span>Consumo mensual</span>
                        <TrendingDown className="h-4 w-4 text-red-400" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-black text-white">{metrics.burnRate}%</p>
                        <p className="text-[10px] text-gray-500">De tus ingresos cubren gastos de este mes</p>
                    </div>
                </div>

                {/* Largest Expense Card */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
                        <span>Mayor Categoría de Gasto</span>
                        <TrendingUp className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-white truncate mt-1.5">{metrics.largestCat}</p>
                        <p className="text-[10px] text-gray-500">Categoría con mayor flujo de salida</p>
                    </div>
                </div>

                {/* Daily Spending Card */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
                        <span>Gasto Promedio Diario</span>
                        <Calendar className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-black text-white">
                            ${metrics.dailyAverage.toLocaleString('es-CO')}
                        </p>
                        <p className="text-[10px] text-gray-500">Monto gastado al día en promedio</p>
                    </div>
                </div>
            </div>

            {/* Visual Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 15 Days Trend Chart */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <LineIcon className="h-5 w-5 text-emerald-400" />
                        <div>
                            <h3 className="text-base font-bold text-white">Historial de Flujo Diario</h3>
                            <p className="text-xs text-gray-500">Ingresos vs Gastos registrados en los últimos 15 días</p>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        {mounted && trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                    <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} />
                                    <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '12px' }}
                                        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    />
                                    <Legend verticalAlign="top" height={36} iconType="circle" />
                                    <Line type="monotone" dataKey="Ingresos" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                                    <Line type="monotone" dataKey="Gastos" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-600 text-xs">
                                Sin información de actividad reciente
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Rankings BarChart */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-emerald-400" />
                        <div>
                            <h3 className="text-base font-bold text-white">Gastos por Categoría</h3>
                            <p className="text-xs text-gray-500">Ranking totalizado de salidas financieras</p>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        {mounted && categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                    <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} />
                                    <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                                    <Tooltip
                                        formatter={(value) => `$${value.toLocaleString('es-CO')}`}
                                        contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="monto" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-600 text-xs">
                                No se encontraron gastos registrados para procesar el ranking
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Methods Breakdown (Pie Chart) */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <PieIcon className="h-5 w-5 text-emerald-400" />
                        <div>
                            <h3 className="text-base font-bold text-white">Métodos de Pago Preferidos</h3>
                            <p className="text-xs text-gray-500">Uso y volumen de gastos según método de pago</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="h-48 w-full flex justify-center">
                            {mounted && paymentData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={paymentData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={75}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {paymentData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => `$${value.toLocaleString('es-CO')}`}
                                            contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '12px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-600 text-xs">
                                    Sin consumos para graficar
                                </div>
                            )}
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {paymentData.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[(index + 3) % COLORS.length] }}></span>
                                        <span>{item.name}</span>
                                    </div>
                                    <span className="font-bold text-white">${item.value.toLocaleString('es-CO')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Financial Health Insights */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 space-y-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-emerald-400" />
                        <div>
                            <h3 className="text-base font-bold text-white">Recomendaciones & Salud Financiera</h3>
                            <p className="text-xs text-gray-500">Sugerencias inteligentes basadas en tus hábitos del mes</p>
                        </div>
                    </div>
                    
                    <div className="space-y-3.5">
                        {insights.map((ins, idx) => {
                            const IconComp = ins.icon
                            return (
                                <div key={idx} className={`flex items-start gap-4 p-4 border rounded-xl ${ins.color}`}>
                                    <IconComp className="h-5 w-5 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-xs text-white">{ins.title}</h4>
                                        <p className="text-[11px] text-gray-400 leading-relaxed">{ins.text}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}