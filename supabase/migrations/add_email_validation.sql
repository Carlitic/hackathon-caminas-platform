-- Add email domain validation constraint
-- This ensures only Conselleria emails can be used

ALTER TABLE profiles
ADD CONSTRAINT valid_conselleria_email 
  CHECK (
    email LIKE '%@edu.gva.es' OR 
    email LIKE '%@alu.edu.gva.es'
  );

-- Verify constraint
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'valid_conselleria_email';
