import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// El middleware de Next.js corre en el Edge Runtime (no tiene acceso al SDK de Firebase)
// La estrategia: verificar la cookie de sesión que Firebase crea automáticamente
// Debug: instrumentar cuándo se redirige al login (cookie, ruta y motivo)

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // #region agent log
    try {
        if (typeof fetch !== 'undefined') {
            fetch('http://127.0.0.1:7708/ingest/40767566-b83b-4b8a-b4d9-1874f3e7c4c7', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8d1efa' },
                body: JSON.stringify({
                    sessionId: '8d1efa',
                    runId: 'pre-fix',
                    hypothesisId: 'H1_middleware_cookie_missing',
                    location: 'src/middleware.ts:middleware-start',
                    message: 'middleware start',
                    data: { pathname },
                    timestamp: Date.now(),
                }),
            }).catch(() => {})
        }
    } catch {}
    // #endregion

    // Rutas públicas (login)
    const publicPaths = ['/login']
    if (publicPaths.includes(pathname)) return NextResponse.next()

    // Verificar si existe token de sesión de Firebase
    // Firebase Auth usa cookies con prefijo específico
    const authCookie = request.cookies.get('firebase-auth-token')

    // #region agent log
    try {
        if (typeof fetch !== 'undefined') {
            fetch('http://127.0.0.1:7708/ingest/40767566-b83b-4b8a-d4d9-1874f3e7c4c7', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8d1efa' },
                body: JSON.stringify({
                    sessionId: '8d1efa',
                    runId: 'pre-fix',
                    hypothesisId: 'H6_middleware_cookie_state_for_protected_path',
                    location: 'src/middleware.ts:cookie-state',
                    message: 'cookie existence check',
                    data: { pathname, hasCookie: !!authCookie },
                    timestamp: Date.now(),
                }),
            }).catch(() => {})
        }
    } catch {}
    // #endregion

    // Importante: este proyecto usa Firebase Auth con persistencia en localStorage.
    // En Edge middleware NO existe esa cookie, así que NO podemos proteger por cookie.
    // El acceso lo valida `PrivateGuard` en el cliente.
    if (!authCookie) {
        // #region agent log
        try {
            if (typeof fetch !== 'undefined') {
                fetch('http://127.0.0.1:7708/ingest/40767566-b83b-4b8a-b4d9-1874f3e7c4c7', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8d1efa' },
                    body: JSON.stringify({
                        sessionId: '8d1efa',
                        runId: 'post-fix',
                        hypothesisId: 'H1_middleware_cookie_missing',
                        location: 'src/middleware.ts:no-cookie-allow',
                        message: 'no firebase-auth-token cookie; allowing route (client guard)',
                        data: { pathname, hasCookie: false },
                        timestamp: Date.now(),
                    }),
                }).catch(() => {})
            }
        } catch {}
        // #endregion
    }

    // #region agent log
    try {
        if (typeof fetch !== 'undefined') {
            fetch('http://127.0.0.1:7708/ingest/40767566-b83b-4b8a-b4d9-1874f3e7c4c7', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8d1efa' },
                body: JSON.stringify({
                    sessionId: '8d1efa',
                    runId: 'pre-fix',
                    hypothesisId: 'H1_middleware_cookie_missing',
                    location: 'src/middleware.ts:allow-with-cookie',
                    message: 'middleware reached end; allowing route',
                    data: { pathname },
                    timestamp: Date.now(),
                }),
            }).catch(() => {})
        }
    } catch {}
    // #endregion

    return NextResponse.next()
}

export const config = {
    // Protege todas las rutas excepto archivos estáticos
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}