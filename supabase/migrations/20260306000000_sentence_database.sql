-- Create sentence database table
CREATE TABLE IF NOT EXISTS public.opendeutsch_sentence_database (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    german TEXT NOT NULL,
    english TEXT NOT NULL,
    chinese TEXT, -- Chinese translation
    parts JSONB, -- Array of strings for sentence parts (programmatically split)
    level TEXT NOT NULL, -- A0, A1, A2, B1
    topic TEXT, -- e.g. 'food', 'travel'
    tense TEXT, -- present, past, etc.
    grammar_focus TEXT, -- e.g. 'accusative case', 'modal verbs'
    structure TEXT, -- e.g. 'S-V-O', 'S-V-IO-DO'
    vocab JSONB, -- Array of vocabulary words/ids contained
    difficulty INTEGER, -- Calculated difficulty score
    source TEXT DEFAULT 'llm', -- 'llm', 'manual', 'template'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    meta JSONB -- Store full metadata like subject, verb, object details
);

-- Enable RLS
ALTER TABLE public.opendeutsch_sentence_database ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read sentences" ON public.opendeutsch_sentence_database
    FOR SELECT TO anon, authenticated USING (true);

-- Allow anon inserts for development/testing (use with caution in production)
CREATE POLICY "Anon insert sentences" ON public.opendeutsch_sentence_database
    FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated users (or service role) to insert
CREATE POLICY "Authenticated insert sentences" ON public.opendeutsch_sentence_database
    FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes for faster lookup
CREATE INDEX IF NOT EXISTS idx_sentences_level ON public.opendeutsch_sentence_database(level);
CREATE INDEX IF NOT EXISTS idx_sentences_topic ON public.opendeutsch_sentence_database(topic);
CREATE INDEX IF NOT EXISTS idx_sentences_tense ON public.opendeutsch_sentence_database(tense);

-- Migration for existing tables (if needed)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opendeutsch_sentence_database' AND column_name = 'chinese') THEN
        ALTER TABLE public.opendeutsch_sentence_database ADD COLUMN chinese TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opendeutsch_sentence_database' AND column_name = 'grammar_focus') THEN
        ALTER TABLE public.opendeutsch_sentence_database ADD COLUMN grammar_focus TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opendeutsch_sentence_database' AND column_name = 'structure') THEN
        ALTER TABLE public.opendeutsch_sentence_database ADD COLUMN structure TEXT;
    END IF;
END $$;
