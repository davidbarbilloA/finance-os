'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Trash2 } from 'lucide-react'
import { useMovimientos } from '@/hooks/useMovimientos'
import type { Bolsillo, Categoria, MetodoPago, MovimientoInput, TipoMovimiento } from '@/types/movimientos.types'

const tipos: TipoMovimiento[] = ['ingreso', 'gasto', 'ahorro', 'deuda']
const categorias: Categoria[] = ['hogar', 'transporte', 'comida', 'entretenimiento', 'suscripciones', 'deudas', 'ahorro', 'salud', 'mascota', 'trabajo', 'educacion', 'otro']
const metodosPago: MetodoPago[] = ['efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia', 'otro']
const bolsillos: Bolsillo[] = ['general', 'hogar', 'ahorro', 'deudas', 'inversion', 'emergencia']

function colorByTipo(tipo: TipoMovimiento) {
    if (tipo === 'ingreso') return 'text-emerald-400'
    if (tipo === 'gasto') return 'text-red-400'
    if (tipo === 'ahorro') return 'text-blue-400'
    return 'text-amber-400'
}

export default function MovimientosPage() {
    const { movimientos, loading, error, crear, eliminar } = useMovimientos()
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState<MovimientoInput>({
        titulo: '',
        descripcion: '',
        monto: 0,
        categoria: 'otro',
        tipo: 'gasto',
        metodoPago: 'efectivo',
        bolsillo: 'general',
        fecha: new Date(),
    })

    const porBolsillo = useMemo(() => {
        return movimientos.reduce<Record<string, typeof movimientos>>((acc, mov) => {
            const key = mov.bolsillo ?? 'general'
            acc[key] = [...(acc[key] ?? []), mov]
            return acc
        }, {})
    }, [movimientos])

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!form.titulo.trim() || !form.monto) return
        setSaving(true)
        try {
            await crear(form)
            setForm((prev) => ({
                ...prev,
                titulo: '',
                descripcion: '',
                monto: 0,
            }))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Movimientos</h1>
                <p className="text-sm text-gray-500 mt-0.5">Registra ingresos, gastos y separa por bolsillos</p>
            </div>

            {error && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                    <p className="text-amber-300 text-sm">{error}</p>
                </div>
            )}

            <form onSubmit={onSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                    value={form.titulo}
                    onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Titulo"
                    className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                />
                <input
                    type="number"
                    min={0}
                    value={form.monto || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, monto: Number(e.target.value || 0) }))}
                    placeholder="Monto"
                    className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                />
                <input
                    type="date"
                    value={format(form.fecha, 'yyyy-MM-dd')}
                    onChange={(e) => setForm((prev) => ({ ...prev, fecha: new Date(`${e.target.value}T00:00:00`) }))}
                    className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                />

                <select
                    value={form.tipo}
                    onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value as TipoMovimiento }))}
                    className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                >
                    {tipos.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
                <select
                    value={form.categoria}
                    onChange={(e) => setForm((prev) => ({ ...prev, categoria: e.target.value as Categoria }))}
                    className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                >
                    {categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
                </select>
                <select
                    value={form.metodoPago}
                    onChange={(e) => setForm((prev) => ({ ...prev, metodoPago: e.target.value as MetodoPago }))}
                    className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                >
                    {metodosPago.map((metodo) => <option key={metodo} value={metodo}>{metodo}</option>)}
                </select>

                <select
                    value={form.bolsillo ?? 'general'}
                    onChange={(e) => setForm((prev) => ({ ...prev, bolsillo: e.target.value as Bolsillo }))}
                    className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                >
                    {bolsillos.map((bolsillo) => <option key={bolsillo} value={bolsillo}>{bolsillo}</option>)}
                </select>
                <input
                    value={form.descripcion ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Descripcion (opcional)"
                    className="md:col-span-2 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                />

                <button
                    type="submit"
                    disabled={saving}
                    className="md:col-span-3 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black font-semibold rounded-lg py-2.5 text-sm transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    {saving ? 'Guardando...' : 'Guardar movimiento'}
                </button>
            </form>

            {loading ? (
                <div className="h-32 rounded-xl bg-gray-900 animate-pulse" />
            ) : (
                <div className="space-y-5">
                    {Object.keys(porBolsillo).length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">Aun no tienes movimientos.</p>
                    ) : (
                        Object.entries(porBolsillo).map(([bolsillo, items]) => (
                            <section key={bolsillo} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                                    Bolsillo: {bolsillo}
                                </h2>
                                <div className="space-y-2">
                                    {items.map((m) => (
                                        <article key={m.id} className="flex items-center justify-between bg-gray-950 border border-gray-800 rounded-lg px-3 py-2">
                                            <div>
                                                <p className="text-sm text-white font-medium">{m.titulo}</p>
                                                <p className="text-xs text-gray-500">
                                                    {m.categoria} · {format(m.fecha, 'd MMM yyyy', { locale: es })}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-sm font-semibold ${colorByTipo(m.tipo)}`}>
                                                    {m.tipo === 'ingreso' ? '+' : '-'}${m.monto.toLocaleString('es-CO')}
                                                </span>
                                                <button
                                                    onClick={() => eliminar(m.id)}
                                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                                    aria-label="Eliminar movimiento"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
