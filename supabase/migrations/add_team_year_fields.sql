-- Ensure teams table has year_level field (if not exists)
-- This field is used to distinguish between Junior (1º) and Senior (2º) teams

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'year_level'
    ) THEN
        ALTER TABLE teams ADD COLUMN year_level text;
    END IF;
END $$;

-- Also ensure year field exists (alternative naming)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'year'
    ) THEN
        ALTER TABLE teams ADD COLUMN year integer;
    END IF;
END $$;

-- Update existing teams to have default year_level if null
UPDATE teams SET year_level = '1' WHERE year_level IS NULL;
UPDATE teams SET year = 1 WHERE year IS NULL;
