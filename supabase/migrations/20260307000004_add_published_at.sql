-- Add published_at column to opendeutsch_readings
ALTER TABLE opendeutsch_readings
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Default published_at to created_at for existing records
UPDATE opendeutsch_readings
SET published_at = created_at
WHERE published_at IS NULL;

-- Force schema cache reload
NOTIFY pgrst, 'reload config';
