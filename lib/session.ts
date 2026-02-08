// Funciones de gestión de sesiones JWT
import { supabase } from './supabase'

/**
 * Invalida todas las sesiones activas
 * Todos los usuarios deberán hacer login de nuevo
 */
export async function invalidateAllSessions() {
    const { error } = await supabase.rpc('invalidate_all_sessions')

    if (error) throw error

    return { success: true, message: 'Todas las sesiones han sido invalidadas' }
}

/**
 * Invalida sesiones de un rol específico
 * @param role - 'student', 'teacher', o 'admin'
 */
export async function invalidateSessionsByRole(role: 'student' | 'teacher' | 'admin') {
    const { error } = await supabase.rpc('invalidate_sessions_by_role', {
        target_role: role
    })

    if (error) throw error

    return { success: true, message: `Sesiones de ${role} invalidadas` }
}

/**
 * Invalida la sesión de un usuario específico
 * @param userId - ID del usuario
 */
export async function invalidateUserSession(userId: string) {
    const { error } = await supabase.rpc('invalidate_user_session', {
        user_id: userId
    })

    if (error) throw error

    return { success: true, message: 'Sesión del usuario invalidada' }
}

/**
 * Obtiene la versión de sesión actual del usuario
 * @param userId - ID del usuario
 */
export async function getUserSessionVersion(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('session_version')
        .eq('id', userId)
        .single()

    if (error) throw error

    return data.session_version || 1
}

/**
 * Valida si la sesión del usuario es válida
 * Compara la versión en el token con la versión en la BD
 */
export async function validateSession(userId: string, tokenVersion: number = 1) {
    const currentVersion = await getUserSessionVersion(userId)

    return {
        valid: tokenVersion >= currentVersion,
        currentVersion,
        tokenVersion
    }
}

/**
 * Obtiene información de la configuración JWT de Supabase
 * Nota: El tiempo de expiración se configura en Supabase Dashboard
 */
export function getJWTInfo() {
    return {
        provider: 'Supabase Auth',
        tokenType: 'JWT (JSON Web Token)',
        storage: 'HTTP-only cookies',
        defaultExpiry: '1 hora (3600s)',
        recommendedForHackathon: '8 horas (28800s)',
        configLocation: 'Supabase Dashboard → Authentication → Settings → JWT Settings'
    }
}
