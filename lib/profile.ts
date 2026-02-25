import { supabase } from "./supabase"

// =====================================================
// FILTRADO DE REQUISITOS PARA ESTUDIANTES
// =====================================================

export async function getMyRequirements(studentId: string) {
    // Obtener perfil del estudiante para conocer su ciclo
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('cycle, id')
        .eq('id', studentId)
        .single()

    if (profileError) throw profileError

    // Extraer tipo de ciclo (DAW, DAM o ASIR) de la cadena completa del ciclo
    let cycleType = ''
    if (profile.cycle?.includes('DAW')) cycleType = 'DAW'
    else if (profile.cycle?.includes('DAM')) cycleType = 'DAM'
    else if (profile.cycle?.includes('ASIR')) cycleType = 'ASIR'

    // Obtener todos los requisitos
    const { data: allRequirements, error } = await supabase
        .from('requirements')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error

    // Filtrar requisitos basándose en:
    // 1. for_all_students = true (todos lo ven)
    // 2. target_cycles incluye el ciclo del estudiante
    // 3. target_students incluye el ID del estudiante
    const filteredRequirements = allRequirements.filter(req => {
        // Si es para todos los estudiantes, mostrar
        if (req.for_all_students) return true

        // Si target_cycles está configurado e incluye el ciclo del estudiante
        if (req.target_cycles && req.target_cycles.length > 0) {
            if (req.target_cycles.includes(cycleType)) return true
        }

        // Si target_students incluye a este estudiante
        if (req.target_students && req.target_students.includes(studentId)) {
            return true
        }

        return false
    })

    return filteredRequirements
}

// =====================================================
// FUNCIONES DE GESTIÓN DE PERFIL
// =====================================================

export async function updateStudentProfile(userId: string, data: {
    full_name?: string
    cycle?: string
    year_level?: string
}) {
    const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)

    if (error) throw error
}

export async function updateTeacherProfile(userId: string, data: {
    full_name?: string
    subjects?: string[]
    is_tutor?: boolean
    tutor_group?: string
}) {
    const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)

    if (error) throw error
}

export async function getMyProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) throw error
    return data
}
