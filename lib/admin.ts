import { supabase } from './supabase'

// Repair Admin Profile (Self-Service)
export async function repairAdminProfile() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("No hay usuario autenticado")

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: user.email!,
                full_name: 'Administrador (Recuperado)',
                role: 'admin',
                approval_status: 'approved'
            })

        if (error) throw error
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Get pending tutor approvals
export async function getPendingTutors() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .eq('is_tutor', true)
        .eq('tutor_approved', false)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

// Get all approved tutors
export async function getApprovedTutors() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .eq('is_tutor', true)
        .eq('tutor_approved', true)
        .order('tutor_group')

    if (error) throw error
    return data
}

// Approve tutor
export async function approveTutor(tutorId: string) {
    // Check if there's already an approved tutor for this group
    const { data: tutor } = await supabase
        .from('profiles')
        .select('tutor_group')
        .eq('id', tutorId)
        .single()

    if (!tutor) throw new Error('Tutor not found')

    const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_tutor', true)
        .eq('tutor_approved', true)
        .eq('tutor_group', tutor.tutor_group)
        .single()

    if (existing) {
        throw new Error(`Ya existe un tutor aprobado para el grupo ${tutor.tutor_group}`)
    }

    const { error } = await supabase
        .from('profiles')
        .update({ tutor_approved: true })
        .eq('id', tutorId)

    if (error) throw error
}

// Deny tutor
export async function denyTutor(tutorId: string) {
    const { error } = await supabase
        .from('profiles')
        .update({ is_tutor: false, tutor_group: null })
        .eq('id', tutorId)

    if (error) throw error
}

// Revoke tutor approval
export async function revokeTutorApproval(tutorId: string) {
    const { error } = await supabase
        .from('profiles')
        .update({ tutor_approved: false })
        .eq('id', tutorId)

    if (error) throw error
}

// Get event config
export async function getEventConfig() {
    const { data, error } = await supabase
        .from('event_config')
        .select('*')
        .single()

    if (error) throw error
    return data
}

// Update event phase
export async function updateEventPhase(phase: string) {
    const { error } = await supabase
        .from('event_config')
        .update({ phase })
        .eq('id', (await getEventConfig()).id)

    if (error) throw error
}

// Get all teams with stats
export async function getAllTeamsWithStats() {
    const { data, error } = await supabase
        .from('teams')
        .select(`
      *,
      members:profiles(id, full_name, cycle, year_level),
      vote_count:votes(count)
    `)
        .order('votes', { ascending: false })

    if (error) throw error
    return data
}
