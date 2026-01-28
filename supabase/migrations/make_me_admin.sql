-- Make sure your user is admin
-- Run this AFTER you register with your email

UPDATE profiles 
SET role = 'admin' 
WHERE email = 'carloscastanosblanco@gmail.com';

-- Verify
SELECT id, email, full_name, role FROM profiles WHERE email = 'carloscastanosblanco@gmail.com';
