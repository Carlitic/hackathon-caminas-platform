import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Obtener el equipo del estudiante actual
export async function getMyTeam(studentId: string) {
    // Primero obtener el team_id del estudiante
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', studentId)
        .single()

    if (profileError) throw profileError
    if (!profile.team_id) return null

    // Luego obtener los detalles del equipo y sus miembros
    const { data: team, error: teamError } = await supabase
        .from('teams')
        .select(`
            *,
            members:profiles(
                id,
                full_name,
                email,
                cycle,
                year_level,
                role
            )
        `)
        .eq('id', profile.team_id)
        .single()

    if (teamError) throw teamError
    return team
}

export async function getAvailableTeachers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, subjects')
        .eq('role', 'teacher')

    if (error) throw error
    return data
}

// Actualizar información pública del proyecto del equipo
export async function updateProjectDetails(
    teamId: string, 
    title?: string, 
    description?: string, 
    githubUrl?: string, 
    imageUrl?: string
) {
    const updates: any = {}
    if (title !== undefined) updates.project_title = title
    if (description !== undefined) updates.project_description = description
    if (githubUrl !== undefined) updates.github_url = githubUrl
    if (imageUrl !== undefined) updates.project_image_url = imageUrl

    const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId)
        .select()
        .single()

    if (error) throw error
    return data
}
