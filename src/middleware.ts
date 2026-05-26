import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// El middleware de Next.js corre en el Edge Runtime (no tiene acceso al SDK de Firebase)
// La estrategia: verificar la cookie de sesión que Firebase crea automáticamente

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Rutas públicas (login)
    const publicPaths = ['/login']
    if (publicPaths.includes(pathname)) return NextResponse.next()

    // Verificar si existe token de sesión de Firebase
    // Firebase Auth usa cookies con prefijo específico
    const authCookie = request.cookies.get('firebase-auth-token')

    // Si no hay cookie, redirigir al login
    if (!authCookie) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    // Protege todas las rutas excepto archivos estáticos
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}