-- =====================================================
-- MIGRATION: Add ENUMs and Complete RLS Policies
-- =====================================================

-- Note: This migration assumes existing data uses lowercase text values
-- We'll create ENUMs and migrate existing data

-- =====================================================
-- 1. CREATE ENUMS
-- =====================================================

-- User roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Cycle types (keeping current format)
DO $$ BEGIN
    CREATE TYPE cycle_type AS ENUM ('1º DAW', '2º DAW', '1º DAM', '2º DAM', '1º ASIR', '2º ASIR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Year levels
DO $$ BEGIN
    CREATE TYPE year_level_type AS ENUM ('1', '2');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Approval status
DO $$ BEGIN
    CREATE TYPE approval_status_type AS ENUM ('pending', 'approved', 'denied');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Team status
DO $$ BEGIN
    CREATE TYPE team_status_type AS ENUM ('PENDING', 'READY', 'LOCKED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. MIGRATE PROFILES TABLE TO USE ENUMS
-- =====================================================

-- Add temporary columns with ENUM types
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role_new user_role,
ADD COLUMN IF NOT EXISTS cycle_new cycle_type,
ADD COLUMN IF NOT EXISTS year_level_new year_level_type,
ADD COLUMN IF NOT EXISTS approval_status_new approval_status_type;

-- Migrate data
UPDATE profiles SET role_new = role::user_role WHERE role IS NOT NULL;
UPDATE profiles SET cycle_new = cycle::cycle_type WHERE cycle IS NOT NULL;
UPDATE profiles SET year_level_new = year_level::year_level_type WHERE year_level IS NOT NULL;
UPDATE profiles SET approval_status_new = approval_status::approval_status_type WHERE approval_status IS NOT NULL;

-- Drop old columns and rename new ones
ALTER TABLE profiles 
DROP COLUMN IF EXISTS role,
DROP COLUMN IF EXISTS cycle,
DROP COLUMN IF EXISTS year_level,
DROP COLUMN IF EXISTS approval_status;

ALTER TABLE profiles 
RENAME COLUMN role_new TO role;
ALTER TABLE profiles 
RENAME COLUMN cycle_new TO cycle;
ALTER TABLE profiles 
RENAME COLUMN year_level_new TO year_level;
ALTER TABLE profiles 
RENAME COLUMN approval_status_new TO approval_status;

-- Set NOT NULL constraints
ALTER TABLE profiles 
ALTER COLUMN role SET NOT NULL,
ALTER COLUMN approval_status SET DEFAULT 'pending'::approval_status_type;

-- =====================================================
-- 3. MIGRATE TEAMS TABLE TO USE ENUMS
-- =====================================================

-- Add temporary columns
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS status_new team_status_type,
ADD COLUMN IF NOT EXISTS year_level_new year_level_type;

-- Migrate data
UPDATE teams SET status_new = status::team_status_type WHERE status IS NOT NULL;
UPDATE teams SET year_level_new = year_level::year_level_type WHERE year_level IS NOT NULL;

-- Drop old and rename
ALTER TABLE teams 
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS year_level;

ALTER TABLE teams 
RENAME COLUMN status_new TO status;
ALTER TABLE teams 
RENAME COLUMN year_level_new TO year_level;

-- Set defaults
ALTER TABLE teams 
ALTER COLUMN status SET DEFAULT 'PENDING'::team_status_type,
ALTER COLUMN year_level SET NOT NULL;

-- =====================================================
-- 4. COMPREHENSIVE RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "teams_select_policy" ON teams;
DROP POLICY IF EXISTS "teams_update_policy" ON teams;
DROP POLICY IF EXISTS "requirements_all" ON requirements;
DROP POLICY IF EXISTS "votes_all" ON votes;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- SELECT: Students see approved profiles, Teachers/Admins see all
CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT USING (
    -- Public can see approved tutors (for registration)
    (is_tutor = true AND tutor_approved = true)
    OR
    -- Authenticated users
    (auth.uid() IS NOT NULL AND (
        -- Students see approved profiles
        (approval_status = 'approved'::approval_status_type)
        OR
        -- Teachers and admins see all
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('teacher'::user_role, 'admin'::user_role)
        )
        OR
        -- Users see their own profile
        id = auth.uid()
    ))
);

-- INSERT: Anyone can create their profile during registration
CREATE POLICY "profiles_insert_policy" ON profiles
FOR INSERT WITH CHECK (
    id = auth.uid()
);

-- UPDATE: Users can update their own profile, Admins can update any
CREATE POLICY "profiles_update_policy" ON profiles
FOR UPDATE USING (
    id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'::user_role
    )
);

-- =====================================================
-- TEAMS POLICIES
-- =====================================================

-- SELECT: Students see their team, Teachers/Admins see all
CREATE POLICY "teams_select_policy" ON teams
FOR SELECT USING (
    -- Public can see all teams (for ranking)
    true
);

-- UPDATE: Tutors can update teams for their students, Admins can update any
CREATE POLICY "teams_update_policy" ON teams
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND (
            role = 'admin'::user_role
            OR
            (is_tutor = true AND tutor_approved = true)
        )
    )
);

-- INSERT: Only admins can create teams
CREATE POLICY "teams_insert_policy" ON teams
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'::user_role
    )
);

-- =====================================================
-- REQUIREMENTS POLICIES
-- =====================================================

-- Teachers can manage their own requirements, students can view
CREATE POLICY "requirements_select_policy" ON requirements
FOR SELECT USING (
    auth.uid() IS NOT NULL
);

CREATE POLICY "requirements_insert_policy" ON requirements
FOR INSERT WITH CHECK (
    teacher_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'teacher'::user_role
    )
);

CREATE POLICY "requirements_update_policy" ON requirements
FOR UPDATE USING (
    teacher_id = auth.uid()
);

CREATE POLICY "requirements_delete_policy" ON requirements
FOR DELETE USING (
    teacher_id = auth.uid()
);

-- =====================================================
-- VOTES POLICIES
-- =====================================================

-- Teachers can vote, anyone can see votes
CREATE POLICY "votes_select_policy" ON votes
FOR SELECT USING (true);

CREATE POLICY "votes_insert_policy" ON votes
FOR INSERT WITH CHECK (
    teacher_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'teacher'::user_role
    )
);

CREATE POLICY "votes_update_policy" ON votes
FOR UPDATE USING (
    teacher_id = auth.uid()
);

-- =====================================================
-- HELP_REQUESTS POLICIES
-- =====================================================

-- Students can create, teachers/admins can view and resolve
CREATE POLICY "help_requests_select_policy" ON help_requests
FOR SELECT USING (
    student_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('teacher'::user_role, 'admin'::user_role)
    )
);

CREATE POLICY "help_requests_insert_policy" ON help_requests
FOR INSERT WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'student'::user_role
    )
);

CREATE POLICY "help_requests_update_policy" ON help_requests
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('teacher'::user_role, 'admin'::user_role)
    )
);
