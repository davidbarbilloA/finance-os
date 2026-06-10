'use client'

import { useState, useMemo } from 'react'
import { useMovimientos } from '@/hooks/useMovimientos'
import { useBolsillos } from '@/hooks/useBolsillos'
import {
    Search, Filter, Trash2, Tag, Calendar, CreditCard, ChevronRight, X, ArrowUpDown, Plus, Sparkles
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
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

export default function MovimientosPage() {
    const { movimientos, loading: loadMov, eliminar } = useMovimientos()
    const { bolsillos, loading: loadBol } = useBolsillos()

    // Search and filters
    const [busqueda, setBusqueda] = useState('')
    const [filtroTipo, setFiltroTipo] = useState<string>('')
    const [filtroCategoria, setFiltroCategoria] = useState<string>('')
    const [filtroBolsillo, setFiltroBolsillo] = useState<string>('')

    // Selected movement details modal
    const [selectedMov, setSelectedMov] = useState<any | null>(null)

    // Filter and sort movements
    const movimientosFiltrados = useMemo(() => {
        return movimientos.filter(m => {
            const matchesBusqueda = m.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
                                    m.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
            const matchesTipo = filtroTipo ? m.tipo === filtroTipo : true
            const matchesCategoria = filtroCategoria ? m.categoria === filtroCategoria : true
            const matchesBolsillo = filtroBolsillo ? m.bolsillo === filtroBolsillo : true

            return matchesBusqueda && matchesTipo && matchesCategoria && matchesBolsillo
        })
    }, [movimientos, busqueda, filtroTipo, filtroCategoria, filtroBolsillo])

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (confirm('¿Estás seguro de que deseas eliminar este movimiento?')) {
            await eliminar(id)
            setSelectedMov(null)
        }
    }

    if (loadMov || loadBol) {
        return (
            <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                <p className="text-gray-400 text-sm">Cargando libro de movimientos...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
                <div>
                    <h1 className="text-2xl font-black text-white">Historial de Movimientos</h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Mostrando {movimientosFiltrados.length} de {movimientos.length} transacciones registradas
                    </p>
                </div>
            </div>

            {/* Filters dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-900/40 p-4 border border-gray-800 rounded-2xl shadow-sm">
                
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por título o descripción..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>

                {/* Filter by Type */}
                <div>
                    <select
                        value={filtroTipo}
                        onChange={e => setFiltroTipo(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="ingreso">Ingresos 🟢</option>
                        <option value="gasto">Gastos 🔴</option>
                        <option value="ahorro">Ahorros 🔵</option>
                        <option value="deuda">Deudas 🟡</option>
                    </select>
                </div>

                {/* Filter by Category */}
                <div>
                    <select
                        value={filtroCategoria}
                        onChange={e => setFiltroCategoria(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                        <option value="">Todas las categorías</option>
                        {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                </div>

                {/* Filter by Pocket */}
                <div>
                    <select
                        value={filtroBolsillo}
                        onChange={e => setFiltroBolsillo(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                        <option value="">Todos los bolsillos</option>
                        {bolsillos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                    </select>
                </div>
            </div>

            {/* List / Table of Movements */}
            <div className="bg-gray-900/20 border border-gray-800 rounded-2xl overflow-hidden shadow-md">
                {movimientosFiltrados.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                        <Sparkles className="h-10 w-10 text-gray-700 mx-auto" />
                        <h3 className="font-bold text-gray-500">Sin movimientos coincidentes</h3>
                        <p className="text-xs text-gray-600 max-w-xs mx-auto">Prueba limpiando los filtros o realizando otra búsqueda.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-800/60">
                        {movimientosFiltrados.map(m => {
                            const bolsilloAsoc = bolsillos.find(b => b.id === m.bolsillo)
                            return (
                                <div
                                    key={m.id}
                                    onClick={() => setSelectedMov(m)}
                                    className="flex items-center justify-between p-4 hover:bg-gray-900/30 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`p-2.5 rounded-xl hidden sm:block shrink-0 ${
                                            m.tipo === 'ingreso' ? 'bg-emerald-500/10 text-emerald-400' :
                                            m.tipo === 'gasto' ? 'bg-red-500/10 text-red-400' :
                                            m.tipo === 'ahorro' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                                        }`}>
                                            {m.tipo === 'ingreso' ? '+' : '-'}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-sm text-white truncate">{m.titulo}</h4>
                                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Tag className="h-3 w-3" />
                                                    {CATEGORIAS.find(c => c.value === m.categoria)?.label || m.categoria}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(m.fecha, 'dd MMM yyyy', { locale: es })}
                                                </span>
                                                {bolsilloAsoc && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: bolsilloAsoc.color }}></span>
                                                            {bolsilloAsoc.nombre}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 shrink-0">
                                        <span className={`font-black text-sm ${
                                            m.tipo === 'ingreso' ? 'text-emerald-400' :
                                            m.tipo === 'gasto' ? 'text-red-400' :
                                            m.tipo === 'ahorro' ? 'text-blue-400' : 'text-amber-400'
                                        }`}>
                                            {m.tipo === 'ingreso' ? '+' : '-'}${m.monto.toLocaleString('es-CO')}
                                        </span>
                                        <button
                                            onClick={(e) => handleDelete(m.id, e)}
                                            className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <ChevronRight className="h-4 w-4 text-gray-600" />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Modal for Details / Deletion */}
            {selectedMov && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                            <h3 className="text-lg font-bold text-white">Detalle del Movimiento</h3>
                            <button onClick={() => setSelectedMov(null)} className="text-gray-500 hover:text-white transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs text-gray-500">Título</h4>
                                <p className="text-base font-bold text-white mt-0.5">{selectedMov.titulo}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-xs text-gray-500">Monto</h4>
                                    <p className={`text-lg font-black mt-0.5 ${
                                        selectedMov.tipo === 'ingreso' ? 'text-emerald-400' :
                                        selectedMov.tipo === 'gasto' ? 'text-red-400' :
                                        selectedMov.tipo === 'ahorro' ? 'text-blue-400' : 'text-amber-400'
                                    }`}>
                                        ${selectedMov.monto.toLocaleString('es-CO')}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xs text-gray-500">Tipo</h4>
                                    <p className="text-sm font-bold text-white mt-0.5 capitalize">{selectedMov.tipo}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs text-gray-500">Categoría</h4>
                                    <p className="text-sm text-gray-300 mt-0.5">
                                        {CATEGORIAS.find(c => c.value === selectedMov.categoria)?.label || selectedMov.categoria}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xs text-gray-500">Método de Pago</h4>
                                    <p className="text-sm text-gray-300 mt-0.5">
                                        {METODOS_PAGO.find(m => m.value === selectedMov.metodoPago)?.label || selectedMov.metodoPago}
                                    </p>
                                </div>
                                {selectedMov.bolsillo && (
                                    <div className="col-span-2">
                                        <h4 className="text-xs text-gray-500">Bolsillo Asociado</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bolsillos.find(b => b.id === selectedMov.bolsillo)?.color || '#10b981' }}></span>
                                            <p className="text-sm font-bold text-white">
                                                {bolsillos.find(b => b.id === selectedMov.bolsillo)?.nombre || selectedMov.bolsillo}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="col-span-2">
                                    <h4 className="text-xs text-gray-500">Fecha</h4>
                                    <p className="text-sm text-gray-300 mt-0.5">
                                        {format(selectedMov.fecha, "d 'de' MMMM 'de' yyyy", { locale: es })}
                                    </p>
                                </div>
                                {selectedMov.descripcion && (
                                    <div className="col-span-2">
                                        <h4 className="text-xs text-gray-500">Descripción</h4>
                                        <p className="text-xs text-gray-400 bg-gray-950/60 border border-gray-800 rounded-xl p-3 mt-1 leading-relaxed whitespace-pre-wrap">
                                            {selectedMov.descripcion}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 border-t border-gray-800 pt-4">
                                <button
                                    onClick={(e) => handleDelete(selectedMov.id, e)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold py-2.5 rounded-xl transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Eliminar
                                </button>
                                <button
                                    onClick={() => setSelectedMov(null)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-xl transition-all"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}