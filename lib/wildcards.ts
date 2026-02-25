import { supabase } from "./supabase"

// =====================================================
// FUNCIONES DE COMODINES / SOLICITUDES DE AYUDA
// =====================================================

export async function getTeamWildcardsStatus(teamId: string) {
    const { data, error } = await supabase
        .from('teams')
        .select('wildcards_used_today, last_wildcard_reset')
        .eq('id', teamId)
        .single()

    if (error) throw error

    const MAX_DAILY_WILDCARDS = 5
    const today = new Date().toISOString().split('T')[0]

    // Comprobar si se necesita restablecer
    const usedToday = data.last_wildcard_reset === today ? data.wildcards_used_today : 0
    const remaining = Math.max(0, MAX_DAILY_WILDCARDS - usedToday)

    return {
        used: usedToday,
        remaining,
        max: MAX_DAILY_WILDCARDS
    }
}

export async function createSupportTicket(teamId: string, message: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Llamar a la función de la base de datos que maneja la validación y creación
    const { data, error } = await supabase.rpc('create_support_ticket', {
        p_team_id: teamId,
        p_created_by: user.id,
        p_message: message
    })

    if (error) throw error

    if (!data.success) {
        throw new Error(data.error)
    }

    return data
}

export async function getSupportTickets(teamId?: string) {
    let query = supabase
        .from('support_tickets')
        .select(`
            *,
            team:teams(name, team_number),
            creator:profiles!created_by(full_name),
            resolver:profiles!resolved_by(full_name)
        `)
        .order('created_at', { ascending: false })

    if (teamId) {
        query = query.eq('team_id', teamId)
    }

    const { data, error } = await query

    if (error) throw error
    return data
}

export async function resolveSupportTicket(ticketId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase
        .from('support_tickets')
        .update({
            resolved: true,
            resolved_at: new Date().toISOString(),
            resolved_by: user.id
        })
        .eq('id', ticketId)

    if (error) throw error
}

// =====================================================
// FUNCIONES DE VALIDACIÓN DE EQUIPOS
// =====================================================

export async function validateTeamComposition(teamId: string) {
    const { data, error } = await supabase.rpc('validate_team_composition', {
        p_team_id: teamId
    })

    if (error) throw error
    return data
}

export async function getTeamCompositionSummary(teamId: string) {
    const { data, error } = await supabase.rpc('get_team_composition_summary', {
        p_team_id: teamId
    })

    if (error) throw error
    return data
}

export async function markTeamAsReady(teamId: string) {
    // Primero validar la composición
    const validation = await validateTeamComposition(teamId)

    if (!validation.valid) {
        throw new Error(`Equipo no válido: ${validation.errors.join(', ')}`)
    }

    // Actualizar estado del equipo (el trigger también validará)
    const { error } = await supabase
        .from('teams')
        .update({ status: 'READY' })
        .eq('id', teamId)

    if (error) throw error
}
