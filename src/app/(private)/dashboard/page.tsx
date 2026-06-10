'use client'

import { useState, useEffect, useMemo } from 'react'
import { useMovimientos } from '@/hooks/useMovimientos'
import { useBolsillos } from '@/hooks/useBolsillos'
import {
    TrendingUp, TrendingDown, PiggyBank, AlertCircle, Plus,
    FolderPlus, Sparkles, Calendar, Tag, CreditCard, X, ChevronRight, PieChart as PieIcon
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import type { Categoria, TipoMovimiento, MetodoPago } from '@/types/movimientos.types'

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

export default function DashboardPage() {
    const { movimientos, loading: loadMov, crear: crearMovimiento } = useMovimientos()
    const { bolsillos, loading: loadBol, crearBolsillo, eliminarBolsillo } = useBolsillos()
    
    const [mounted, setMounted] = useState(false)
    const [showMovModal, setShowMovModal] = useState(false)
    const [showBolModal, setShowBolModal] = useState(false)

    // Form states for Movement
    const [titulo, setTitulo] = useState('')
    const [monto, setMonto] = useState('')
    const [tipo, setTipo] = useState<TipoMovimiento>('gasto')
    const [categoria, setCategoria] = useState<Categoria>('comida')
    const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo')
    const [bolsilloAsoc, setBolsilloAsoc] = useState('')
    const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [descripcion, setDescripcion] = useState('')

    // Form states for Pocket
    const [bolNombre, setBolNombre] = useState('')
    const [bolColor, setBolColor] = useState('#10b981')
    const [bolMeta, setBolMeta] = useState('')

    useEffect(() => {
        setMounted(true)
    }, [])

    // Calculate pocket balances
    const bolsillosConSaldo = useMemo(() => {
        return bolsillos.map(bol => {
            const movsDelBolsillo = movimientos.filter(m => m.bolsillo === bol.id)
            const saldo = movsDelBolsillo.reduce((total, m) => {
                if (m.tipo === 'ingreso' || m.tipo === 'ahorro') return total + m.monto
                return total - m.monto
            }, 0)
            return {
                ...bol,
                saldo
            }
        })
    }, [bolsillos, movimientos])

    const stats = useMemo(() => {
        const ahora = new Date()
        const inicio = startOfMonth(ahora)
        const fin = endOfMonth(ahora)

        const delMes = movimientos.filter(m =>
            isWithinInterval(m.fecha, { start: inicio, end: fin })
        )

        const ingresos = delMes.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0)
        const gastos = delMes.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0)
        const ahorros = delMes.filter(m => m.tipo === 'ahorro').reduce((s, m) => s + m.monto, 0)
        const deudas = delMes.filter(m => m.tipo === 'deuda').reduce((s, m) => s + m.monto, 0)
        const balance = ingresos - gastos

        return { ingresos, gastos, ahorros, deudas, balance, recientes: movimientos.slice(0, 5) }
    }, [movimientos])

    // Charts data
    const chartData = useMemo(() => {
        const ultimos7Dias = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - i)
            return format(d, 'yyyy-MM-dd')
        }).reverse()

        return ultimos7Dias.map(dia => {
            const diaMovs = movimientos.filter(m => format(m.fecha, 'yyyy-MM-dd') === dia)
            const ingresos = diaMovs.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0)
            const gastos = diaMovs.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0)
            return {
                fecha: format(new Date(dia), 'dd MMM', { locale: es }),
                Ingresos: ingresos,
                Gastos: gastos
            }
        })
    }, [movimientos])

    const pieData = useMemo(() => {
        const categoriasMap: Record<string, number> = {}
        movimientos.filter(m => m.tipo === 'gasto').forEach(m => {
            categoriasMap[m.categoria] = (categoriasMap[m.categoria] || 0) + m.monto
        })
        return Object.entries(categoriasMap).map(([name, value]) => ({
            name: CATEGORIAS.find(c => c.value === name)?.label || name,
            value
        }))
    }, [movimientos])

    const handleCrearMovimiento = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!titulo || !monto) return
        await crearMovimiento({
            titulo,
            monto: Number(monto),
            tipo,
            categoria,
            metodoPago,
            bolsillo: bolsilloAsoc || undefined,
            fecha: new Date(fecha),
            descripcion: descripcion || undefined
        })
        setShowMovModal(false)
        // Reset states
        setTitulo('')
        setMonto('')
        setBolsilloAsoc('')
        setDescripcion('')
    }

    const handleCrearBolsillo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!bolNombre) return
        await crearBolsillo(bolNombre, bolColor, bolMeta ? Number(bolMeta) : undefined)
        setShowBolModal(false)
        setBolNombre('')
        setBolMeta('')
    }

    if (loadMov || loadBol) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                <p className="text-gray-400 text-sm animate-pulse">Cargando tu ecosistema financiero...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            
            {/* Top banner / Welcome */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                        <Sparkles className="h-3.5 w-3.5" />
                        Finanzas Activas
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Tu Ecosistema Financiero</h1>
                    <p className="text-sm text-gray-400 max-w-md">Controla tus gastos, organiza tus bolsillos y observa crecer tu balance mensual.</p>
                </div>
                <div className="flex gap-3 shrink-0 w-full sm:w-auto">
                    <button
                        onClick={() => setShowMovModal(true)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="h-4 w-4" />
                        Registrar Movimiento
                    </button>
                    <button
                        onClick={() => setShowBolModal(true)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl border border-gray-800 text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <FolderPlus className="h-4 w-4 text-emerald-400" />
                        Nuevo Bolsillo
                    </button>
                </div>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Balance Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/20 to-emerald-950/10 border border-emerald-500/20 rounded-2xl p-6 shadow-xl">
                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Balance Mensual</span>
                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                            <TrendingUp className="h-5 w-5 text-emerald-400" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-black text-white">
                            ${stats.balance.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-gray-400">Total ingresos menos gastos este mes</p>
                    </div>
                </div>

                {/* Gastos Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-red-500/10 to-red-950/5 border border-red-500/20 rounded-2xl p-6 shadow-xl">
                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl"></div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-red-400 uppercase tracking-wider">Gastos de Hoy</span>
                        <div className="p-2 bg-red-500/10 rounded-xl">
                            <TrendingDown className="h-5 w-5 text-red-400" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-black text-white">
                            ${stats.gastos.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-gray-400">Total salidas registradas este mes</p>
                    </div>
                </div>

                {/* Ahorros Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-950/5 border border-blue-500/20 rounded-2xl p-6 shadow-xl">
                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Ahorros</span>
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <PiggyBank className="h-5 w-5 text-blue-400" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-black text-white">
                            ${stats.ahorros.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-gray-400">Reservado en bolsillos u objetivos</p>
                    </div>
                </div>

                {/* Deudas Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-amber-950/5 border border-amber-500/20 rounded-2xl p-6 shadow-xl">
                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Deudas</span>
                        <div className="p-2 bg-amber-500/10 rounded-xl">
                            <AlertCircle className="h-5 w-5 text-amber-400" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-black text-white">
                            ${stats.deudas.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-gray-400">Compromisos de pago pendientes</p>
                    </div>
                </div>
            </div>

            {/* Dashboard sections (Charts & Bolsillos) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Charts Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 space-y-6 shadow-md">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-bold text-white">Actividad Reciente</h3>
                                <p className="text-xs text-gray-500">Tendencia de ingresos y gastos de la última semana</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold">
                                <span className="flex items-center gap-1.5 text-emerald-400">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    Ingresos
                                </span>
                                <span className="flex items-center gap-1.5 text-red-400">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                    Gastos
                                </span>
                            </div>
                        </div>
                        <div className="h-56 sm:h-72 w-full">
                            {mounted && chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                        <XAxis dataKey="fecha" stroke="#4b5563" fontSize={11} tickLine={false} />
                                        <YAxis stroke="#4b5563" fontSize={11} tickLine={false} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '12px' }}
                                            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        />
                                        <Area type="monotone" dataKey="Ingresos" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIngresos)" />
                                        <Area type="monotone" dataKey="Gastos" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorGastos)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-600 text-sm">
                                    Sin datos de actividad reciente
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Donut Chart Categories */}
                    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 space-y-6 shadow-md">
                        <div className="flex items-center gap-2">
                            <PieIcon className="h-5 w-5 text-emerald-400" />
                            <div>
                                <h3 className="text-lg font-bold text-white">Distribución de Gastos</h3>
                                <p className="text-xs text-gray-500">Tus consumos mensuales por categoría</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="h-48 w-full flex justify-center">
                                {mounted && pieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value) => value !== undefined && value !== null ? `$${Number(value).toLocaleString('es-CO')}` : ''}
                                                contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '12px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-600 text-sm">
                                        Registra gastos para ver la distribución
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2">
                                {pieData.map((item, index) => (
                                    <div key={item.name} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                            <span>{item.name}</span>
                                        </div>
                                        <span className="font-bold text-white">${item.value.toLocaleString('es-CO')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bolsillos (Pockets) Column */}
                <div className="space-y-6">
                    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 shadow-md flex flex-col h-full space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white">Mis Bolsillos</h3>
                                <p className="text-xs text-gray-500">Metas y ahorros individuales</p>
                            </div>
                            <button
                                onClick={() => setShowBolModal(true)}
                                className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto max-h-[460px] pr-1">
                            {bolsillosConSaldo.length === 0 ? (
                                <div className="text-center py-12 space-y-3">
                                    <PiggyBank className="h-10 w-10 text-gray-600 mx-auto" />
                                    <p className="text-gray-500 text-sm">No tienes bolsillos creados.</p>
                                    <button 
                                        onClick={() => setShowBolModal(true)}
                                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                                    >
                                        Crear mi primer bolsillo
                                    </button>
                                </div>
                            ) : (
                                bolsillosConSaldo.map(bol => {
                                    const pct = bol.montoObjetivo ? Math.min(Math.round((bol.saldo / bol.montoObjetivo) * 100), 100) : 0
                                    return (
                                        <div key={bol.id} className="p-4 bg-gray-950/60 border border-gray-800 rounded-xl hover:border-gray-700 transition-all space-y-3 group relative">
                                            <button
                                                onClick={() => eliminarBolsillo(bol.id)}
                                                className="absolute top-3 right-3 text-gray-600 hover:text-red-400 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                            <div className="flex items-center gap-3">
                                                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: bol.color }}></span>
                                                <span className="font-bold text-white text-sm">{bol.nombre}</span>
                                            </div>
                                            <div className="flex flex-wrap justify-between items-baseline gap-x-2 gap-y-1 text-xs text-gray-400">
                                                <span>Ahorrado: <strong className="text-white">${bol.saldo.toLocaleString('es-CO')}</strong></span>
                                                {bol.montoObjetivo && (
                                                    <span>Meta: ${bol.montoObjetivo.toLocaleString('es-CO')}</span>
                                                )}
                                            </div>
                                            {bol.montoObjetivo && (
                                                <div className="space-y-1">
                                                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: bol.color }}></div>
                                                    </div>
                                                    <span className="text-[10px] text-gray-500 block text-right">{pct}% de la meta</span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* Ultimos movimientos */}
                    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 shadow-md space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Últimos Movimientos</h3>
                        </div>
                        <div className="space-y-3">
                            {stats.recientes.length === 0 ? (
                                <p className="text-gray-600 text-xs text-center py-6">Sin transacciones registradas</p>
                            ) : (
                                stats.recientes.map(m => (
                                    <div key={m.id} className="flex items-center justify-between bg-gray-950/40 border border-gray-800 rounded-xl px-4 py-3 text-xs hover:border-gray-700 transition-all">
                                        <div className="space-y-1">
                                            <p className="font-bold text-white">{m.titulo}</p>
                                            <p className="text-[10px] text-gray-500">
                                                {CATEGORIAS.find(c => c.value === m.categoria)?.label || m.categoria} · {format(m.fecha, 'd LLL', { locale: es })}
                                            </p>
                                        </div>
                                        <span className={`font-black ${m.tipo === 'ingreso' ? 'text-emerald-400' :
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
            </div>

            {/* Modal for Nuevo Movimiento */}
            {showMovModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                            <h3 className="text-lg font-bold text-white">Registrar Movimiento</h3>
                            <button onClick={() => setShowMovModal(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCrearMovimiento} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Título del movimiento</label>
                                    <input 
                                        type="text" required value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej. Compras Supermercado"
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Monto ($)</label>
                                    <input 
                                        type="number" required value={monto} onChange={e => setMonto(e.target.value)} placeholder="0"
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Tipo</label>
                                    <select 
                                        value={tipo} onChange={e => setTipo(e.target.value as TipoMovimiento)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    >
                                        <option value="gasto">Gasto 🔴</option>
                                        <option value="ingreso">Ingreso 🟢</option>
                                        <option value="ahorro">Ahorro 🔵</option>
                                        <option value="deuda">Deuda 🟡</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Categoría</label>
                                    <select 
                                        value={categoria} onChange={e => setCategoria(e.target.value as Categoria)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    >
                                        {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Método de Pago</label>
                                    <select 
                                        value={metodoPago} onChange={e => setMetodoPago(e.target.value as MetodoPago)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    >
                                        {METODOS_PAGO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Bolsillo Asociado (Opcional)</label>
                                    <select 
                                        value={bolsilloAsoc} onChange={e => setBolsilloAsoc(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    >
                                        <option value="">Ninguno</option>
                                        {bolsillos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Fecha</label>
                                    <input 
                                        type="date" required value={fecha} onChange={e => setFecha(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Descripción</label>
                                    <textarea 
                                        value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej. Detalle de compras mensuales" rows={2}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold py-3 rounded-xl transition-all">
                                Guardar Movimiento
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Nuevo Bolsillo */}
            {showBolModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                            <h3 className="text-lg font-bold text-white">Nuevo Bolsillo</h3>
                            <button onClick={() => setShowBolModal(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCrearBolsillo} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1">Nombre del bolsillo</label>
                                <input 
                                    type="text" required value={bolNombre} onChange={e => setBolNombre(e.target.value)} placeholder="Ej. Vacaciones, Alquiler"
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1">Meta / Objetivo de ahorro (Opcional)</label>
                                <input 
                                    type="number" value={bolMeta} onChange={e => setBolMeta(e.target.value)} placeholder="Ej. 1000000"
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-1">Color representativo</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {COLORS.map(c => (
                                        <button
                                            key={c} type="button" onClick={() => setBolColor(c)}
                                            className={`w-7 h-7 rounded-full border-2 transition-all ${bolColor === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                            style={{ backgroundColor: c }}
                                        ></button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold py-3 rounded-xl transition-all">
                                Crear Bolsillo
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}