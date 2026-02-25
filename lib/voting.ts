import { supabase } from './supabase'

// Votar por un equipo
export async function voteForTeam(teacherId: string, teamId: string) {
    try {
        // Comprobar si el profesor ya ha votado
        const { data: existingVote } = await supabase
            .from('votes')
            .select('id')
            .eq('teacher_id', teacherId)
            .single()

        if (existingVote) {
            throw new Error('Ya has votado. Solo puedes votar una vez.')
        }

        // Insertar voto
        const { error: voteError } = await supabase
            .from('votes')
            .insert({
                teacher_id: teacherId,
                team_id: teamId
            })

        if (voteError) throw voteError

        // Incrementar votos del equipo
        const { error: updateError } = await supabase.rpc('increment_team_votes', {
            team_id_param: teamId
        })

        if (updateError) {
            // Respaldo: actualización manual
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

// Obtener voto del profesor
export async function getTeacherVote(teacherId: string) {
    const { data, error } = await supabase
        .from('votes')
        .select('team_id, teams(name)')
        .eq('teacher_id', teacherId)
        .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
}

// Obtener todos los equipos para votar
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

// Obtener ranking (todos los equipos ordenados por votos)
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

    // Añadir posición
    return data.map((team, index) => ({
        ...team,
        position: index + 1
    }))
}

// Crear requisito
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

// Obtener todos los requisitos
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

// Eliminar requisito
export async function deleteRequirement(requirementId: string, teacherId: string) {
    const { error } = await supabase
        .from('requirements')
        .delete()
        .eq('id', requirementId)
        .eq('teacher_id', teacherId)

    if (error) throw error
}
