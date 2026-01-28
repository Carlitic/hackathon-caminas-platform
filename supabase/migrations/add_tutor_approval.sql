-- Migration: Add tutor approval system
-- This adds the tutor_approved field and unique constraint

-- Step 1: Add tutor_approved column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tutor_approved BOOLEAN DEFAULT false;

-- Step 2: Add the unique constraint for approved tutors
-- Note: EXCLUDE constraint requires btree_gist extension
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Step 3: Add the constraint
ALTER TABLE profiles
ADD CONSTRAINT unique_approved_tutor_per_group 
  EXCLUDE USING gist (tutor_group WITH =) 
  WHERE (is_tutor = true AND tutor_approved = true);

-- Step 4: Update existing tutors (optional - approve all existing tutors)
-- Uncomment the line below if you want to auto-approve existing tutors
-- UPDATE profiles SET tutor_approved = true WHERE is_tutor = true;

-- Verification query
SELECT 
  full_name, 
  tutor_group, 
  is_tutor, 
  tutor_approved 
FROM profiles 
WHERE is_tutor = true
ORDER BY tutor_group;
