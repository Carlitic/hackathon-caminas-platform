-- =====================================================
-- FIX: Allow tutors to see their own profile even if not approved
-- =====================================================

-- Drop the existing policy
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;

-- CREATE NEW POLICY: Allow users to see their own profile always
CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT USING (
    -- Users can always see their own profile
    id = auth.uid()
    OR
    -- Public can see approved tutors
    (is_tutor = true AND tutor_approved = true)
    OR
    -- Authenticated users can see approved student profiles
    (auth.uid() IS NOT NULL AND approval_status = 'approved'::approval_status_type)
);
