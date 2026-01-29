import { supabase } from './supabase'

// Get pending students for approval (only for tutors)
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

// Get approved students (my students)
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

// Approve student
export async function approveStudent(studentId: string) {
    const { error } = await supabase
        .from('profiles')
        .update({ approval_status: 'approved' })
        .eq('id', studentId)

    if (error) throw error
}

// Deny student
export async function denyStudent(studentId: string) {
    const { error } = await supabase
        .from('profiles')
        .update({ approval_status: 'denied' })
        .eq('id', studentId)

    if (error) throw error
}

// Delete student
export async function deleteStudent(studentId: string) {
    // First delete from auth
    const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', studentId)

    if (profileError) throw profileError
}

// Update student
export async function updateStudent(studentId: string, data: { full_name: string; email: string; cycle: string }) {
    const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', studentId)

    if (error) throw error
}

// Get teams
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

// Get students without team (for team formation)
export async function getStudentsWithoutTeam(tutorGroup: string) {
    // Extract subject from tutor_group (e.g., "1º DAW" -> "DAW")
    const subject = tutorGroup.split(' ')[1]
    const year = tutorGroup.split(' ')[0].charAt(0) // "1" or "2"

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .eq('approval_status', 'approved')
        .eq('year_level', year)
        .is('team_id', null)
        .ilike('cycle', `%${subject}%`) // Only students from same subject
        .order('full_name')

    if (error) throw error
    return data
}

// Add student to team
export async function addStudentToTeam(studentId: string, teamId: string) {
    const { error } = await supabase
        .from('profiles')
        .update({ team_id: teamId })
        .eq('id', studentId)

    if (error) throw error

    // Check if team is now ready (6 members)
    await checkTeamStatus(teamId)
}

// Remove student from team
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

    // Update team status
    if (student?.team_id) {
        await checkTeamStatus(student.team_id)
    }
}

// Check and update team status
async function checkTeamStatus(teamId: string) {
    const { data: members } = await supabase
        .from('profiles')
        .select('id, cycle, year_level')
        .eq('team_id', teamId)

    if (!members) return

    // Check if team has 6 members from same year
    const isReady = members.length === 6 &&
        members.every(m => m.year_level === members[0].year_level)

    await supabase
        .from('teams')
        .update({ status: isReady ? 'READY' : 'PENDING' })
        .eq('id', teamId)
}

// Create new team
export async function createTeam(yearLevel: string) {
    // Get next team number
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
            year_level: yearLevel,
            status: 'PENDING'
        })
        .select()
        .single()

    if (error) throw error
    return data
}
