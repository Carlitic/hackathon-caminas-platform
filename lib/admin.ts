import { supabase } from './supabase'

// Reparar Perfil de Admin (Autoservicio)
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

// Reparar Perfil de Profesor (Autoservicio)
export async function repairTeacherProfile() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("No hay usuario autenticado")

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: user.email!,
                full_name: 'Profesor (Recuperado)',
                role: 'teacher',
                is_tutor: false,
                subjects: ['General'],
                approval_status: 'approved'
            })

        if (error) throw error
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Reparar Perfil de Estudiante (Autoservicio)
export async function repairStudentProfile() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("No hay usuario autenticado")

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: user.email!,
                full_name: 'Estudiante (Recuperado)',
                role: 'student',
                cycle: 'DAW', // Respaldo por defecto
                approval_status: 'pending' // Requiere aprobación del profesor
            })

        if (error) throw error
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Obtener aprobaciones de tutor pendientes
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

// Obtener todos los tutores aprobados
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

// Aprobar tutor
export async function approveTutor(tutorId: string) {
    // Comprobar si ya hay un tutor aprobado para este grupo
    const { data: tutor } = await supabase
        .from('profiles')
        .select('tutor_group')
        .eq('id', tutorId)
        .single()

    if (!tutor) throw new Error('Tutor not found')

    const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_tutor', true)
        .eq('tutor_approved', true)
        .eq('tutor_group', tutor.tutor_group)
        .maybeSingle()

    if (checkError) throw checkError

    if (existing) {
        throw new Error(`Ya existe un tutor aprobado para el grupo ${tutor.tutor_group}`)
    }

    const { error } = await supabase
        .from('profiles')
        .update({ tutor_approved: true })
        .eq('id', tutorId)

    if (error) throw error
}

// Denegar tutor
export async function denyTutor(tutorId: string) {
    const { error } = await supabase
        .from('profiles')
        .update({ is_tutor: false, tutor_group: null })
        .eq('id', tutorId)

    if (error) throw error
}

// Revocar aprobación de tutor
export async function revokeTutorApproval(tutorId: string) {
    const { error } = await supabase
        .from('profiles')
        .update({ tutor_approved: false })
        .eq('id', tutorId)

    if (error) throw error
}

// Obtener configuración del evento
export async function getEventConfig() {
    const { data, error } = await supabase
        .from('event_config')
        .select('*')
        .single()

    if (error) throw error
    return data
}

// Actualizar fase del evento
export async function updateEventPhase(phase: string) {
    const { error } = await supabase
        .from('event_config')
        .update({ phase })
        .eq('id', (await getEventConfig()).id)

    if (error) throw error
}

// Obtener todos los equipos con estadísticas
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

// Crear equipo como admin
export async function createTeamAsAdmin(yearLevel: string) {
    // Obtener el siguiente número de equipo
    const { data: teams } = await supabase
        .from('teams')
        .select('team_number')
        .order('team_number', { ascending: false })
        .limit(1)

    const nextNumber = teams && teams.length > 0 ? teams[0].team_number + 1 : 1

    const { data, error } = await supabase
        .from('teams')
        .insert({
            name: `Equipo ${nextNumber}`,
            team_number: nextNumber,
            year: parseInt(yearLevel), // Usar el campo 'year' como entero
            status: 'PENDING'
        })
        .select()
        .single()

    if (error) throw error
    return data
}
