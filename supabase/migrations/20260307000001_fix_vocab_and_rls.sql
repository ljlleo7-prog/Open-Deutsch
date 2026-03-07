
-- Fix vocab column type in sentence database (JSONB -> TEXT[])
-- This enables the use of the overlap operator (&&) for filtering
ALTER TABLE public.opendeutsch_sentence_database 
ALTER COLUMN vocab TYPE TEXT[] USING (
  CASE 
    WHEN jsonb_typeof(vocab) = 'array' THEN 
      ARRAY(SELECT jsonb_array_elements_text(vocab))
    ELSE 
      NULL 
  END
);

-- Fix RLS for vocab database to allow anonymous inserts (for development)
DROP POLICY IF EXISTS "Allow public read access" ON public.opendeutsch_vocab_database;
DROP POLICY IF EXISTS "Allow service role full access" ON public.opendeutsch_vocab_database;

-- Re-create policies with broader permissions
CREATE POLICY "Allow public read access" ON public.opendeutsch_vocab_database
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow anon insert vocab" ON public.opendeutsch_vocab_database
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON public.opendeutsch_vocab_database
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Add index for array overlap search if not exists
CREATE INDEX IF NOT EXISTS idx_sentences_vocab ON public.opendeutsch_sentence_database USING GIN (vocab);
