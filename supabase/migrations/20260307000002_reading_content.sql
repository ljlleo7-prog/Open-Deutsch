-- Create table for readings
CREATE TABLE IF NOT EXISTS opendeutsch_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    topic TEXT NOT NULL,
    level TEXT NOT NULL,
    source_name TEXT,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for vocabulary
CREATE TABLE IF NOT EXISTS opendeutsch_reading_vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reading_id UUID REFERENCES opendeutsch_readings(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    translation TEXT NOT NULL,
    pos TEXT, -- Part of speech
    definition TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for questions
CREATE TABLE IF NOT EXISTS opendeutsch_reading_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reading_id UUID REFERENCES opendeutsch_readings(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options TEXT[] NOT NULL,
    correct_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE opendeutsch_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeutsch_reading_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE opendeutsch_reading_questions ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access for readings" ON opendeutsch_readings
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access for vocabulary" ON opendeutsch_reading_vocabulary
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access for questions" ON opendeutsch_reading_questions
    FOR SELECT USING (true);

-- Allow service role full access (implicit, but good to be explicit about intent if we had user roles)
-- We don't need explicit policies for service role as it bypasses RLS.
