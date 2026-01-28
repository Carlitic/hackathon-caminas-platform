-- Create first admin user
-- IMPORTANT: Replace 'your-email@example.com' with your actual email
-- This script should be run AFTER you've registered through the UI

-- Update an existing user to admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@edu.gva.es'; -- Change this to your email

-- Verify
SELECT id, email, full_name, role FROM profiles WHERE role = 'admin';
