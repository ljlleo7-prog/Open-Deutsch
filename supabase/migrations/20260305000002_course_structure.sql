-- Levels table
CREATE TABLE IF NOT EXISTS public.opendeutsch_levels (
    id TEXT PRIMARY KEY, -- A0, A1, A2, B1
    name TEXT NOT NULL,
    description TEXT,
    total_xp_target INTEGER NOT NULL,
    order_index INTEGER NOT NULL
);

-- Stages table
CREATE TABLE IF NOT EXISTS public.opendeutsch_stages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level_id TEXT REFERENCES public.opendeutsch_levels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL
);

-- Update Lessons table to link to Stages
ALTER TABLE public.opendeutsch_lessons 
ADD COLUMN IF NOT EXISTS stage_id UUID REFERENCES public.opendeutsch_stages(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS concept TEXT, -- The grammar/vocab concept taught
ADD COLUMN IF NOT EXISTS required_xp INTEGER DEFAULT 0;

-- Blocks table (Concepts within a lesson)
CREATE TABLE IF NOT EXISTS public.opendeutsch_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id TEXT REFERENCES public.opendeutsch_lessons(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- vocabulary, grammar_cloze, word_order, etc.
    concept TEXT NOT NULL, -- Specific concept tested
    order_index INTEGER NOT NULL
);

-- User Block Progress
CREATE TABLE IF NOT EXISTS public.opendeutsch_user_block_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.opendeutsch_users(id) ON DELETE CASCADE,
    block_id UUID REFERENCES public.opendeutsch_blocks(id) ON DELETE CASCADE,
    score FLOAT DEFAULT 0, -- Percentage 0-100
    xp_earned INTEGER DEFAULT 0,
    status TEXT DEFAULT 'locked', -- locked, available, passed, mastered, failed
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, block_id)
);

-- User XP by Category
CREATE TABLE IF NOT EXISTS public.opendeutsch_user_xp (
    user_id UUID REFERENCES public.opendeutsch_users(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- Vocabulary, Grammar, Sentence, Reading, Comprehension
    amount INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, category)
);

-- RLS Policies
ALTER TABLE public.opendeutsch_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read levels" ON public.opendeutsch_levels FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.opendeutsch_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read stages" ON public.opendeutsch_stages FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.opendeutsch_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read blocks" ON public.opendeutsch_blocks FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.opendeutsch_user_block_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own block progress" ON public.opendeutsch_user_block_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own block progress" ON public.opendeutsch_user_block_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own block progress" ON public.opendeutsch_user_block_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.opendeutsch_user_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own xp" ON public.opendeutsch_user_xp FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own xp" ON public.opendeutsch_user_xp FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own xp" ON public.opendeutsch_user_xp FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed Initial Levels
INSERT INTO public.opendeutsch_levels (id, name, description, total_xp_target, order_index) VALUES
('A0', 'Absolute Beginner', 'Introduction to German sounds and basic words.', 200, 0),
('A1', 'Beginner', 'Basic communication and daily life.', 900, 1),
('A2', 'Elementary', 'Simple sentences and routine tasks.', 2200, 2),
('B1', 'Intermediate', 'Independent use of language.', 4500, 3)
ON CONFLICT (id) DO NOTHING;
