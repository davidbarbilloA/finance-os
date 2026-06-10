// Tipos centrales de la aplicación - la fuente de verdad del modelo de datos

export type TipoMovimiento = 'ingreso' | 'gasto' | 'ahorro' | 'deuda'

export type MetodoPago =
    | 'efectivo'
    | 'tarjeta_debito'
    | 'tarjeta_credito'
    | 'transferencia'
    | 'otro'

export type Categoria =
    | 'hogar'
    | 'transporte'
    | 'comida'
    | 'entretenimiento'
    | 'suscripciones'
    | 'deudas'
    | 'ahorro'
    | 'salud'
    | 'mascota'
    | 'trabajo'
    | 'educacion'
    | 'otro'

export interface BolsilloInfo {
    id: string
    nombre: string
    color: string
    montoObjetivo?: number
    userId: string
    createdAt: Date
}

export interface Movimiento {
    id: string
    titulo: string
    descripcion?: string
    monto: number
    categoria: Categoria
    tipo: TipoMovimiento
    metodoPago: MetodoPago
    bolsillo?: string // Id o nombre del bolsillo asociado
    fecha: Date
    // Metadatos automáticos
    createdAt: Date
    updatedAt: Date
    userId: string
}

// Para crear/editar (sin id ni metadatos automáticos)
export type MovimientoInput = Omit<Movimiento, 'id' | 'createdAt' | 'updatedAt' | 'userId'>

// Para el dashboard
export interface ResumenFinanciero {
    totalIngresos: number
    totalGastos: number
    totalAhorros: number
    totalDeudas: number
    balance: number
    movimientosDelMes: number
}