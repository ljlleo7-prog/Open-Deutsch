
-- Migration to create the opendeutsch_exercises_database table

CREATE TABLE IF NOT EXISTS public.opendeutsch_exercises_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept TEXT NOT NULL,
    level TEXT NOT NULL,
    prompt TEXT NOT NULL,
    options JSONB NOT NULL,
    answer TEXT NOT NULL,
    explanation TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraint to avoid duplicate questions for the same concept and level
    CONSTRAINT unique_concept_level_prompt UNIQUE (concept, level, prompt)
);

-- Add indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_exercises_concept_level ON public.opendeutsch_exercises_database(concept, level);

-- Enable RLS
ALTER TABLE public.opendeutsch_exercises_database ENABLE ROW LEVEL SECURITY;

-- Policies
-- Allow read access to authenticated users and anon (if public exercises)
CREATE POLICY "Allow public read access" ON public.opendeutsch_exercises_database
    FOR SELECT USING (true);

-- Allow service role to full access (implicit, but good to be explicit if needed for specific roles)
-- Note: Service role always has full access, so we just need read for users.

