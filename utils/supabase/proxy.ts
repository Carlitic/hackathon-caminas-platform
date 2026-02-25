import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // MEDIDA DE SEGURIDAD: Si no se proporciona una URL de Supabase (o es la predeterminada), obviar la lógica del middleware para evitar cierres inesperados
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL' || !supabaseKey) {
        console.warn("⚠️ Supabase credentials missing. Middleware skipped.");
        return supabaseResponse;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANTE: Evita escribir cualquier lógica entre createServerClient y
    // supabase.auth.getUser(). Un simple error podría hacer muy difícil de depurar
    // los problemas con usuarios que cierran sesión aleatoriamente.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // Rutas públicas que NO requieren iniciar sesión (incluye /changelog para el historial de versiones)
    const publicPaths = ['/', '/login', '/register', '/register/teacher', '/ranking', '/dashboard', '/changelog']
    const isPublicPath = publicPaths.some(p => path === p || path.startsWith('/auth'))

    // 1. Si el usuario NO ha iniciado sesión e intenta acceder a una ruta protegida
    if (!user && !isPublicPath) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // 2. Si el usuario SÍ ha iniciado sesión e intenta acceder a páginas de autenticación (login/registro)
    if (user && (path === '/login' || path === '/register' || path === '/register/teacher')) {
        // Redirigir a un dashboard por defecto. Como no sabemos el rol fácilmente sin una consulta a la BD
        // (y queremos evitar el uso de la BD en el middleware si es posible), simplemente los enviamos
        // al dashboard que redirigirá según corresponda. Prevenir el acceso al login es una buena UX.
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard' // Redirigir a la página enrutadora que maneja el acceso por roles
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
