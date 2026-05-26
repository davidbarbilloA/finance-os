import {
    collection, addDoc, updateDoc, deleteDoc, doc,
    getDocs, query, where, orderBy, Timestamp,
    onSnapshot, QueryConstraint
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import type { Movimiento, MovimientoInput } from '@/types/movimientos.types'

const COLECCION = 'movimientos'

// Convierte documento Firestore → tipo Movimiento
function docToMovimiento(id: string, data: Record<string, unknown>): Movimiento {
    return {
        id,
        ...data,
        fecha: (data.fecha as Timestamp).toDate(),
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as Movimiento
}

export class MovimientosService {

    // CREATE
    static async crear(input: MovimientoInput): Promise<string> {
        const userId = auth.currentUser?.uid
        if (!userId) throw new Error('No autenticado')

        const docRef = await addDoc(collection(db, COLECCION), {
            ...input,
            fecha: Timestamp.fromDate(input.fecha),
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        })
        return docRef.id
    }

    // READ — con filtros opcionales
    static async obtenerTodos(filtros?: {
        tipo?: string
        categoria?: string
        desde?: Date
        hasta?: Date
    }): Promise<Movimiento[]> {
        const userId = auth.currentUser?.uid
        if (!userId) throw new Error('No autenticado')

        const constraints: QueryConstraint[] = [
            where('userId', '==', userId),
            orderBy('fecha', 'desc'),
        ]

        if (filtros?.tipo) constraints.push(where('tipo', '==', filtros.tipo))
        if (filtros?.categoria) constraints.push(where('categoria', '==', filtros.categoria))

        const q = query(collection(db, COLECCION), ...constraints)
        const snapshot = await getDocs(q)

        return snapshot.docs.map(doc => docToMovimiento(doc.id, doc.data()))
    }

    // UPDATE
    static async actualizar(id: string, input: Partial<MovimientoInput>): Promise<void> {
        const docRef = doc(db, COLECCION, id)
        await updateDoc(docRef, {
            ...input,
            ...(input.fecha && { fecha: Timestamp.fromDate(input.fecha) }),
            updatedAt: Timestamp.now(),
        })
    }

    // DELETE
    static async eliminar(id: string): Promise<void> {
        await deleteDoc(doc(db, COLECCION, id))
    }

    // REALTIME — escucha cambios en tiempo real (útil para el dashboard)
    static suscribir(
        userId: string,
        callback: (movimientos: Movimiento[]) => void,
        onError?: (error: { code?: string; message?: string }) => void
    ) {
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
                        location: 'src/services/movimientos.service.ts:suscribir',
                        message: 'subscribing to movimientos query',
                        data: { collection: COLECCION, userId },
                        timestamp: 0,
                    }),
                }).catch(() => {})
            }
        } catch {}
        // #endregion

        const q = query(
            collection(db, COLECCION),
            where('userId', '==', userId),
            orderBy('fecha', 'desc')
        )

        return onSnapshot(
            q,
            (snapshot) => {
                const movimientos = snapshot.docs.map(doc =>
                    docToMovimiento(doc.id, doc.data())
                )

                // #region agent log
                try {
                    if (typeof fetch !== 'undefined') {
                        fetch('http://127.0.0.1:7708/ingest/40767566-b83b-4b8a-b4d9-1874f3e7c4c7', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8d1efa' },
                            body: JSON.stringify({
                                sessionId: '8d1efa',
                                runId: 'firestore-permission-debug',
                                hypothesisId: 'H11_firestore_allow_check',
                                location: 'src/services/movimientos.service.ts:onSnapshot-next',
                                message: 'snapshot received',
                                data: { size: snapshot.size },
                                timestamp: 0,
                            }),
                        }).catch(() => {})
                    }
                } catch {}
                // #endregion

                callback(movimientos)
            },
            (error) => {
                const typedError = error as { code?: string; message?: string }
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
                                location: 'src/services/movimientos.service.ts:onSnapshot-error',
                                message: 'snapshot listener error',
                                data: {
                                    code: typedError.code,
                                    message: typedError.message,
                                },
                                timestamp: 0,
                            }),
                        }).catch(() => {})
                    }
                } catch {}
                // #endregion

                onError?.(typedError)
            }
        )
    }
}