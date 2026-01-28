import { supabase } from './supabase'

export interface RegisterStudentData {
    email: string
    password: string
    fullName: string
    cycle: string
    tutorId: string
}

export interface RegisterTeacherData {
    email: string
    password: string
    fullName: string
    isTutor: boolean
    tutorGroup?: string
    subjects: string[]
}

export interface LoginData {
    email: string
    password: string
}

// Register Student
export async function registerStudent(data: RegisterStudentData) {
    try {
        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
        })

        if (authError) throw authError
        if (!authData.user) throw new Error('No user returned from signup')

        // 2. Create profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                email: data.email,
                full_name: data.fullName,
                role: 'student',
                cycle: data.cycle,
                tutor_id: data.tutorId,
                approval_status: 'pending',
            })

        if (profileError) throw profileError

        return { success: true, user: authData.user }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Register Teacher
export async function registerTeacher(data: RegisterTeacherData) {
    try {
        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
        })

        if (authError) throw authError
        if (!authData.user) throw new Error('No user returned from signup')

        // 2. Create profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                email: data.email,
                full_name: data.fullName,
                role: 'teacher',
                is_tutor: data.isTutor,
                tutor_group: data.tutorGroup,
                subjects: data.subjects,
            })

        if (profileError) throw profileError

        return { success: true, user: authData.user }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Login
export async function login(data: LoginData) {
    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        })

        if (authError) throw authError
        if (!authData.user) throw new Error('No user returned from login')

        // Get user profile to check role and approval status
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single()

        if (profileError) throw profileError

        // Check if student is approved
        if (profile.role === 'student' && profile.approval_status !== 'approved') {
            await supabase.auth.signOut()
            throw new Error('Tu cuenta aún no ha sido aprobada por tu tutor')
        }

        return { success: true, user: authData.user, profile }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// Logout
export async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

// Get current user profile
export async function getCurrentUserProfile() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return profile
}

// Get tutors for student registration
export async function getTutors() {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, tutor_group')
        .eq('role', 'teacher')
        .eq('is_tutor', true)
        .order('full_name')

    if (error) throw error
    return data
}
