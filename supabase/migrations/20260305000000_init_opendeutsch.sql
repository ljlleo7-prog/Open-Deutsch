-- Create users table extending auth.users
CREATE TABLE IF NOT EXISTS public.opendeutsch_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    official_level TEXT DEFAULT 'A0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.opendeutsch_users ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can view their own profile" ON public.opendeutsch_users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.opendeutsch_users
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.opendeutsch_users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Lessons table
CREATE TABLE IF NOT EXISTS public.opendeutsch_lessons (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    level TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    order_index INTEGER
);
ALTER TABLE public.opendeutsch_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read lessons" ON public.opendeutsch_lessons FOR SELECT TO anon, authenticated USING (true);

-- Word pools for deterministic generation
CREATE TABLE IF NOT EXISTS public.opendeutsch_word_pools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    value TEXT NOT NULL,
    level TEXT NOT NULL,
    tags TEXT[],
    metadata JSONB
);
ALTER TABLE public.opendeutsch_word_pools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read word pools" ON public.opendeutsch_word_pools FOR SELECT TO anon, authenticated USING (true);

-- Exercise templates
CREATE TABLE IF NOT EXISTS public.opendeutsch_exercise_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level TEXT NOT NULL,
    type TEXT NOT NULL,
    structure TEXT NOT NULL,
    constraints JSONB
);
ALTER TABLE public.opendeutsch_exercise_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read templates" ON public.opendeutsch_exercise_templates FOR SELECT TO anon, authenticated USING (true);

-- Reading texts
CREATE TABLE IF NOT EXISTS public.opendeutsch_reading_texts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    level TEXT NOT NULL,
    topic TEXT NOT NULL,
    word_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.opendeutsch_reading_texts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read texts" ON public.opendeutsch_reading_texts FOR SELECT TO anon, authenticated USING (true);

-- Reading questions
CREATE TABLE IF NOT EXISTS public.opendeutsch_reading_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text_id UUID REFERENCES public.opendeutsch_reading_texts(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options TEXT[] NOT NULL,
    correct_index INTEGER NOT NULL,
    type TEXT NOT NULL
);
ALTER TABLE public.opendeutsch_reading_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read questions" ON public.opendeutsch_reading_questions FOR SELECT TO anon, authenticated USING (true);

-- User Progress
CREATE TABLE IF NOT EXISTS public.opendeutsch_user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.opendeutsch_users(id) ON DELETE CASCADE,
    lesson_id TEXT,
    exercise_type TEXT,
    completed BOOLEAN DEFAULT FALSE,
    score FLOAT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.opendeutsch_user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own progress" ON public.opendeutsch_user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.opendeutsch_user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.opendeutsch_user_progress FOR UPDATE USING (auth.uid() = user_id);

-- User Read History
CREATE TABLE IF NOT EXISTS public.opendeutsch_user_read_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.opendeutsch_users(id) ON DELETE CASCADE,
    text_id UUID REFERENCES public.opendeutsch_reading_texts(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.opendeutsch_user_read_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own history" ON public.opendeutsch_user_read_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own history" ON public.opendeutsch_user_read_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Skill Metrics
CREATE TABLE IF NOT EXISTS public.opendeutsch_skill_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.opendeutsch_users(id) ON DELETE CASCADE,
    skill_type TEXT NOT NULL,
    mastery_percentage FLOAT DEFAULT 0,
    performance_data JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_type)
);
ALTER TABLE public.opendeutsch_skill_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own metrics" ON public.opendeutsch_skill_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own metrics" ON public.opendeutsch_skill_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own metrics" ON public.opendeutsch_skill_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Interests
CREATE TABLE IF NOT EXISTS public.opendeutsch_user_interests (
    user_id UUID REFERENCES public.opendeutsch_users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    weight FLOAT DEFAULT 1.0,
    PRIMARY KEY (user_id, topic)
);
ALTER TABLE public.opendeutsch_user_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own interests" ON public.opendeutsch_user_interests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own interests" ON public.opendeutsch_user_interests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own interests" ON public.opendeutsch_user_interests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own interests" ON public.opendeutsch_user_interests FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions explicitly
GRANT SELECT ON public.opendeutsch_lessons TO anon, authenticated;
GRANT SELECT ON public.opendeutsch_word_pools TO anon, authenticated;
GRANT SELECT ON public.opendeutsch_exercise_templates TO anon, authenticated;
GRANT SELECT ON public.opendeutsch_reading_texts TO anon, authenticated;
GRANT SELECT ON public.opendeutsch_reading_questions TO anon, authenticated;
