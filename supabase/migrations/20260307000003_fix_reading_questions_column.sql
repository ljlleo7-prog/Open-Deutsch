-- Fix missing reading_id column in opendeutsch_reading_questions
-- This likely happened because the table was created in a previous migration without this column
-- or the previous migration was partially applied/modified.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'opendeutsch_reading_questions'
        AND column_name = 'reading_id'
    ) THEN
        ALTER TABLE opendeutsch_reading_questions
        ADD COLUMN reading_id UUID REFERENCES opendeutsch_readings(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Force schema cache reload (usually automatic, but good to be sure if possible)
NOTIFY pgrst, 'reload config';
