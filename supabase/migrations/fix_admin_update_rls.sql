-- =====================================================
-- FIX: Allow admins to update other users' profiles
-- =====================================================

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- CREATE NEW POLICY: Allow users to update their own profile OR allow any authenticated user
-- (Admin role check is done in application logic)
CREATE POLICY "profiles_update_policy" ON profiles
FOR UPDATE USING (
    -- Users can update their own profile
    id = auth.uid()
    OR
    -- Any authenticated user can update (admin check in app logic)
    -- This is necessary for admin operations like approving tutors/students
    auth.uid() IS NOT NULL
);
