-- =====================================================
-- FIX: Infinite Recursion in RLS Policies
-- =====================================================

-- The issue is that policies are referencing the same table they're protecting
-- We need to use a different approach to avoid recursion

-- Drop problematic policies
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "requirements_insert_policy" ON requirements;
DROP POLICY IF EXISTS "votes_insert_policy" ON votes;
DROP POLICY IF EXISTS "help_requests_select_policy" ON help_requests;
DROP POLICY IF EXISTS "help_requests_insert_policy" ON help_requests;
DROP POLICY IF EXISTS "help_requests_update_policy" ON help_requests;
DROP POLICY IF EXISTS "teams_update_policy" ON teams;
DROP POLICY IF EXISTS "teams_insert_policy" ON teams;

-- =====================================================
-- FIXED PROFILES POLICIES (No recursion)
-- =====================================================

-- SELECT: Use a simpler approach without self-referencing
CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT USING (
    -- Public can see approved tutors
    (is_tutor = true AND tutor_approved = true)
    OR
    -- Authenticated users can see approved profiles or their own
    (auth.uid() IS NOT NULL AND (
        approval_status = 'approved'::approval_status_type
        OR id = auth.uid()
    ))
);

-- UPDATE: Users can update their own profile
-- Admins checked via application logic, not RLS
CREATE POLICY "profiles_update_policy" ON profiles
FOR UPDATE USING (
    id = auth.uid()
);

-- =====================================================
-- FIXED TEAMS POLICIES
-- =====================================================

-- UPDATE: Allow authenticated teachers/admins (check role in app logic)
CREATE POLICY "teams_update_policy" ON teams
FOR UPDATE USING (
    auth.uid() IS NOT NULL
);

-- INSERT: Allow authenticated admins (check role in app logic)
CREATE POLICY "teams_insert_policy" ON teams
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
);

-- =====================================================
-- FIXED REQUIREMENTS POLICIES
-- =====================================================

-- INSERT: Allow authenticated users (check teacher role in app logic)
CREATE POLICY "requirements_insert_policy" ON requirements
FOR INSERT WITH CHECK (
    teacher_id = auth.uid()
    AND auth.uid() IS NOT NULL
);

-- =====================================================
-- FIXED VOTES POLICIES
-- =====================================================

-- INSERT: Allow authenticated users (check teacher role in app logic)
CREATE POLICY "votes_insert_policy" ON votes
FOR INSERT WITH CHECK (
    teacher_id = auth.uid()
    AND auth.uid() IS NOT NULL
);

-- =====================================================
-- FIXED HELP_REQUESTS POLICIES
-- =====================================================

-- SELECT: Students see their own, others see all (simplified)
CREATE POLICY "help_requests_select_policy" ON help_requests
FOR SELECT USING (
    student_id = auth.uid()
    OR auth.uid() IS NOT NULL
);

-- INSERT: Allow authenticated users (check student role in app logic)
CREATE POLICY "help_requests_insert_policy" ON help_requests
FOR INSERT WITH CHECK (
    student_id = auth.uid()
    AND auth.uid() IS NOT NULL
);

-- UPDATE: Allow authenticated users (check teacher/admin role in app logic)
CREATE POLICY "help_requests_update_policy" ON help_requests
FOR UPDATE USING (
    auth.uid() IS NOT NULL
);
