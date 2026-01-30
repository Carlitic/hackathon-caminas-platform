import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // SAFE GUARD: If no Supabase URL is provided (or is default), skip middleware logic to prevent crash
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

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // Define public paths that don't require authentication
    const publicPaths = ['/', '/login', '/register', '/register/teacher', '/ranking']
    const isPublicPath = publicPaths.some(p => path === p || path.startsWith('/auth'))

    // 1. If user is NOT logged in and tries to access a protected route
    if (!user && !isPublicPath) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // 2. If user IS logged in and tries to access auth pages (login/register)
    if (user && (path === '/login' || path === '/register' || path === '/register/teacher')) {
        // Redirect to a default dashboard. Since we don't know the role easily without DB query (and we want to avoid DB usage in middleware if possible, 
        // though we could get it from metadata if updated), we can just let them go to the landing or a generic 'dashboard' that redirects.
        // For now, let's redirect to landing, or better, check if we can get metadata.
        // Actually, preventing /login access is good UX.
        const url = request.nextUrl.clone()
        url.pathname = '/' // Helper page or landing that will redirect based on CheckAuth client-side
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
