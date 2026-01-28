import { supabase } from './supabase'

// Vote for a team
export async function voteForTeam(teacherId: string, teamId: string) {
    try {
        // Check if teacher already voted
        const { data: existingVote } = await supabase
            .from('votes')
            .select('id')
            .eq('teacher_id', teacherId)
            .single()

        if (existingVote) {
            throw new Error('Ya has votado. Solo puedes votar una vez.')
        }

        // Insert vote
        const { error: voteError } = await supabase
            .from('votes')
            .insert({
                teacher_id: teacherId,
                team_id: teamId
            })

        if (voteError) throw voteError

        // Increment team votes
        const { error: updateError } = await supabase.rpc('increment_team_votes', {
            team_id_param: teamId
        })

        if (updateError) {
            // Fallback: manual update
            const { data: team } = await supabase
                .from('teams')
                .select('votes')
                .eq('id', teamId)
                .single()

            if (team) {
                await supabase
                    .from('teams')
                    .update({ votes: team.votes + 1 })
                    .eq('id', teamId)
            }
        }

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Get teacher's vote
export async function getTeacherVote(teacherId: string) {
    const { data, error } = await supabase
        .from('votes')
        .select('team_id, teams(name)')
        .eq('teacher_id', teacherId)
        .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
}

// Get all teams for voting
export async function getTeamsForVoting() {
    const { data, error } = await supabase
        .from('teams')
        .select(`
      *,
      members:profiles(id, full_name, cycle)
    `)
        .eq('status', 'READY')
        .order('team_number')

    if (error) throw error
    return data
}

// Get ranking (all teams sorted by votes)
export async function getRanking() {
    const { data, error } = await supabase
        .from('teams')
        .select(`
      *,
      members:profiles(id, full_name, cycle, year_level)
    `)
        .order('votes', { ascending: false })
        .order('team_number')

    if (error) throw error

    // Add position
    return data.map((team, index) => ({
        ...team,
        position: index + 1
    }))
}

// Create requirement
export async function createRequirement(teacherId: string, data: {
    title: string
    tag: string
    subject: string
}) {
    const { error } = await supabase
        .from('requirements')
        .insert({
            teacher_id: teacherId,
            title: data.title,
            tag: data.tag,
            subject: data.subject
        })

    if (error) throw error
}

// Get all requirements
export async function getRequirements() {
    const { data, error } = await supabase
        .from('requirements')
        .select(`
      *,
      teacher:profiles(full_name)
    `)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

// Delete requirement
export async function deleteRequirement(requirementId: string, teacherId: string) {
    const { error } = await supabase
        .from('requirements')
        .delete()
        .eq('id', requirementId)
        .eq('teacher_id', teacherId)

    if (error) throw error
}
