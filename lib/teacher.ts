import { supabase } from './supabase'

// Obtener estudiantes pendientes de aprobación (solo para tutores)
export async function getPendingStudents(tutorId: string) {
    const { data: tutor } = await supabase
        .from('profiles')
        .select('tutor_group')
        .eq('id', tutorId)
        .single()

    if (!tutor) throw new Error('Tutor not found')

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .eq('approval_status', 'pending')
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

// Obtener estudiantes aprobados (mis estudiantes)
export async function getMyStudents(tutorId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*, teams(name, team_number, status)')
        .eq('role', 'student')
        .eq('approval_status', 'approved')
        .eq('tutor_id', tutorId)
        .order('full_name')

    if (error) throw error
    return data
}

// Aprobar estudiante
export async function approveStudent(studentId: string) {
    const { error } = await supabase
        .from('profiles')
        .update({ approval_status: 'approved' })
        .eq('id', studentId)

    if (error) throw error
}

// Denegar estudiante
export async function denyStudent(studentId: string) {
    const { error } = await supabase
        .from('profiles')
        .update({ approval_status: 'denied' })
        .eq('id', studentId)

    if (error) throw error
}

// Eliminar estudiante
export async function deleteStudent(studentId: string) {
    // Primero eliminar de auth
    const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', studentId)

    if (profileError) throw profileError
}

// Actualizar estudiante
export async function updateStudent(studentId: string, data: { full_name: string; email: string; cycle: string }) {
    const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', studentId)

    if (error) throw error
}

// Obtener equipos
export async function getTeams(yearLevel?: string) {
    let query = supabase
        .from('teams')
        .select(`
      *,
      members:profiles(id, full_name, cycle, year_level)
    `)
        .order('team_number')

    if (yearLevel) {
        query = query.eq('year_level', yearLevel)
    }

    const { data, error } = await query

    if (error) throw error
    return data
}

// Obtener estudiantes sin equipo (para la formación de equipos)
export async function getStudentsWithoutTeam(tutorGroup: string) {
    // Extraer especialidad de tutor_group (ej., "1º DAW" -> "DAW")
    const subject = tutorGroup.split(' ')[1]
    const year = tutorGroup.split(' ')[0].charAt(0) // "1" o "2"

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .eq('approval_status', 'approved')
        .eq('year_level', year)
        .is('team_id', null)
        .ilike('cycle', `%${subject}%`) // Solo estudiantes de la misma especialidad
        .order('full_name')

    if (error) throw error
    return data
}

// Añadir estudiante al equipo
export async function addStudentToTeam(studentId: string, teamId: string) {
    const { error } = await supabase
        .from('profiles')
        .update({ team_id: teamId })
        .eq('id', studentId)

    if (error) throw error

    // Comprobar si el equipo ya está listo (6 miembros)
    await checkTeamStatus(teamId)
}

// Eliminar estudiante del equipo
export async function removeStudentFromTeam(studentId: string) {
    const { data: student } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', studentId)
        .single()

    const { error } = await supabase
        .from('profiles')
        .update({ team_id: null })
        .eq('id', studentId)

    if (error) throw error

    // Actualizar el estado del equipo
    if (student?.team_id) {
        await checkTeamStatus(student.team_id)
    }
}

// Comprobar y actualizar el estado del equipo
async function checkTeamStatus(teamId: string) {
    const { data: members } = await supabase
        .from('profiles')
        .select('id, cycle, year_level')
        .eq('team_id', teamId)

    if (!members) return

    // Comprobar si el equipo tiene 6 miembros del mismo curso
    const isReady = members.length === 6 &&
        members.every(m => m.year_level === members[0].year_level)

    await supabase
        .from('teams')
        .update({ status: isReady ? 'READY' : 'PENDING' })
        .eq('id', teamId)
}

// Crear nuevo equipo
export async function createTeam(yearLevel: string) {
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
// --- REQUISITOS ---

export async function getRequirements(teacherId: string) {
    const { data, error } = await supabase
        .from('requirements')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function createRequirement(data: {
    title: string,
    description: string,
    tag: string,
    target_cycles?: string[],
    target_students?: string[],
    for_all_students?: boolean
}) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No user")

    const { error } = await supabase
        .from('requirements')
        .insert({
            title: data.title,
            description: data.description,
            tag: data.tag,
            target_cycles: data.target_cycles || [],
            target_students: data.target_students || [],
            for_all_students: data.for_all_students ?? true,
            teacher_id: user.id
        })

    if (error) throw error
}

export async function updateRequirement(id: string, data: {
    title: string,
    description: string,
    tag: string,
    target_cycles?: string[],
    target_students?: string[],
    for_all_students?: boolean
}) {
    const { error } = await supabase
        .from('requirements')
        .update({
            title: data.title,
            description: data.description,
            tag: data.tag,
            target_cycles: data.target_cycles || [],
            target_students: data.target_students || [],
            for_all_students: data.for_all_students ?? true
        })
        .eq('id', id)

    if (error) throw error
}

export async function deleteRequirement(id: string) {
    const { error } = await supabase
        .from('requirements')
        .delete()
        .eq('id', id)

    if (error) throw error
}

// --- VOTACIONES ---

export async function castVote(teamId: number) { // teamId es uuid en DB, usar number temporalmente si se requiere
    // Asumir que usamos team_number o uuid real para VOTAR.

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No user")

    // Usar UPSERT en teacher_id para gestionar "Cambiar Voto"
    const { error } = await supabase
        .from('votes')
        .upsert({
            teacher_id: user.id,
            team_id: teamId // Riesgo de desajuste de tipo si la UI envía número en vez de UUID
        }, { onConflict: 'teacher_id' })

    if (error) throw error
}

export async function getMyVote() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('votes')
        .select('team_id')
        .eq('teacher_id', user.id)
        .single()

    if (error && error.code !== 'PGRST116') throw error // Ignorar error 'not found'
    return data ? data.team_id : null
}
