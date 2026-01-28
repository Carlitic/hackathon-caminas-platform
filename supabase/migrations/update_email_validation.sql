-- Update email validation constraint to allow your personal email
-- This allows specific admin email + Conselleria emails

ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS valid_conselleria_email;

ALTER TABLE profiles
ADD CONSTRAINT valid_hackathon_email 
  CHECK (
    email = 'carloscastanosblanco@gmail.com' OR -- Your personal email
    email LIKE '%@edu.gva.es' OR 
    email LIKE '%@alu.edu.gva.es'
  );
