-- Add fields to requirements table for enhanced filtering and targeting

ALTER TABLE requirements 
ADD COLUMN IF NOT EXISTS target_cycles text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_students text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS for_all_students boolean DEFAULT true;

-- Update existing requirements to have default values
UPDATE requirements 
SET target_cycles = '{}', 
    target_students = '{}', 
    for_all_students = true 
WHERE target_cycles IS NULL;
