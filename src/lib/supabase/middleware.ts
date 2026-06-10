import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// El middleware necesita su propio cliente porque opera en el Edge Runtime
// Su responsabilidad: refrescar el token de sesión en cada request
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    // Propagar cookies tanto al request como al response
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANTE: esta llamada refresca el token si está por expirar
    // NO elimines esto — sin este await, las sesiones expirarán sin renovarse
    const { data: { user } } = await supabase.auth.getUser()

    // Redirigir al login si no hay sesión en rutas privadas
    const isPrivateRoute = !request.nextUrl.pathname.startsWith('/login')
    if (!user && isPrivateRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}