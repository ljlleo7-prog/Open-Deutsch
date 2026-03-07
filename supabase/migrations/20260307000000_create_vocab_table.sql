
-- Create vocabulary table
CREATE TABLE IF NOT EXISTS public.opendeutsch_vocab_database (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    root TEXT NOT NULL,
    meaning TEXT,
    level TEXT,
    type TEXT,
    details JSONB,
    forms JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT opendeutsch_vocab_root_key UNIQUE (root)
);

-- Enable RLS
ALTER TABLE public.opendeutsch_vocab_database ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON public.opendeutsch_vocab_database
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow service role full access" ON public.opendeutsch_vocab_database
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create index on level for faster filtering
CREATE INDEX IF NOT EXISTS idx_vocab_level ON public.opendeutsch_vocab_database(level);
