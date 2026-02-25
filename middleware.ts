import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/proxy'

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Coincidir con todas las rutas de solicitud excepto aquellas que empiecen por:
         * - _next/static (archivos estáticos)
         * - _next/image (archivos de optimización de imágenes)
         * - favicon.ico (archivo de icono)
         * Siéntete libre de modificar este patrón para incluir más rutas.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
