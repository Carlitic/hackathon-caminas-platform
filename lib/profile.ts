import { supabase } from "./supabase"

// =====================================================
// REQUIREMENTS FILTERING FOR STUDENTS
// =====================================================

export async function getMyRequirements(studentId: string) {
    // Get student profile to know their cycle
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('cycle, id')
        .eq('id', studentId)
        .single()

    if (profileError) throw profileError

    // Extract cycle type (DAW, DAM, or ASIR) from full cycle string
    let cycleType = ''
    if (profile.cycle?.includes('DAW')) cycleType = 'DAW'
    else if (profile.cycle?.includes('DAM')) cycleType = 'DAM'
    else if (profile.cycle?.includes('ASIR')) cycleType = 'ASIR'

    // Get all requirements
    const { data: allRequirements, error } = await supabase
        .from('requirements')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error

    // Filter requirements based on:
    // 1. for_all_students = true (everyone sees it)
    // 2. target_cycles includes student's cycle
    // 3. target_students includes student's ID
    const filteredRequirements = allRequirements.filter(req => {
        // If for all students, show it
        if (req.for_all_students) return true

        // If target_cycles is set and includes student's cycle
        if (req.target_cycles && req.target_cycles.length > 0) {
            if (req.target_cycles.includes(cycleType)) return true
        }

        // If target_students includes this student
        if (req.target_students && req.target_students.includes(studentId)) {
            return true
        }

        return false
    })

    return filteredRequirements
}

// =====================================================
// PROFILE MANAGEMENT FUNCTIONS
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
