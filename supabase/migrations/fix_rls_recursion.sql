-- Fix for Infinite Recursion in RLS policies
-- We replace direct queries to 'profiles' inside policies with a SECURITY DEFINER function
-- This allows checking roles without triggering RLS recursively

-- 1. Create a helper function to get the current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  -- Attempt to get role from jwt metadata first (if synced)
  -- But since we rely on the profiles table, let's query it securely
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "Teachers can read student profiles" ON profiles;
DROP POLICY IF EXISTS "Teachers can create teams" ON teams;
DROP POLICY IF EXISTS "Teachers can update teams" ON teams;
DROP POLICY IF EXISTS "Teachers can insert own vote" ON votes;
DROP POLICY IF EXISTS "Teachers can create requirements" ON requirements;
DROP POLICY IF EXISTS "Admins can update event config" ON event_config;

-- 3. Re-create policies using the safe function

-- PROFILES
CREATE POLICY "Teachers can read student profiles" ON profiles
  FOR SELECT USING (
    get_my_role() = 'teacher'
  );

-- TEAMS
CREATE POLICY "Teachers can create teams" ON teams
  FOR INSERT WITH CHECK (
    get_my_role() = 'teacher'
  );

CREATE POLICY "Teachers can update teams" ON teams
  FOR UPDATE USING (
    get_my_role() IN ('teacher', 'admin')
  );

-- VOTES
CREATE POLICY "Teachers can insert own vote" ON votes
  FOR INSERT WITH CHECK (
    auth.uid() = teacher_id
    AND get_my_role() = 'teacher'
  );

-- REQUIREMENTS
CREATE POLICY "Teachers can create requirements" ON requirements
  FOR INSERT WITH CHECK (
    auth.uid() = teacher_id
    AND get_my_role() = 'teacher'
  );

-- EVENT CONFIG
CREATE POLICY "Admins can update event config" ON event_config
  FOR UPDATE USING (
    get_my_role() = 'admin'
  );
