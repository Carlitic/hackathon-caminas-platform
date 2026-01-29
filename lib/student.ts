import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Get current student's team
export async function getMyTeam(studentId: string) {
    // First get the student's team_id
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', studentId)
        .single()

    if (profileError) throw profileError
    if (!profile.team_id) return null

    // Then get the team details and members
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

// Get available teachers for help requests (Wildcards)
export async function getAvailableTeachers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, subjects')
        .eq('role', 'teacher')

    if (error) throw error
    return data
}
