-- Extend user profile for XP + SSO metadata
ALTER TABLE public.opendeutsch_users
ADD COLUMN IF NOT EXISTS total_xp FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS sso_provider TEXT,
ADD COLUMN IF NOT EXISTS sso_subject TEXT,
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMP WITH TIME ZONE;

-- Level rules with multipliers (seedless; managed by app if desired)
CREATE TABLE IF NOT EXISTS public.opendeutsch_level_rules (
    level TEXT PRIMARY KEY,
    min_xp INTEGER NOT NULL,
    xp_multiplier FLOAT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.opendeutsch_level_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read level rules" ON public.opendeutsch_level_rules
    FOR SELECT TO anon, authenticated USING (true);

-- XP event ledger
CREATE TABLE IF NOT EXISTS public.opendeutsch_xp_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.opendeutsch_users(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    base_points INTEGER NOT NULL,
    multiplier FLOAT NOT NULL DEFAULT 1,
    awarded_points FLOAT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.opendeutsch_xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own xp events" ON public.opendeutsch_xp_events
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own xp events" ON public.opendeutsch_xp_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Weekly/monthly XP summaries
CREATE TABLE IF NOT EXISTS public.opendeutsch_xp_periods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.opendeutsch_users(id) ON DELETE CASCADE,
    period_type TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    xp_earned FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, period_type, period_start)
);
ALTER TABLE public.opendeutsch_xp_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own xp periods" ON public.opendeutsch_xp_periods
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own xp periods" ON public.opendeutsch_xp_periods
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own xp periods" ON public.opendeutsch_xp_periods
    FOR UPDATE USING (auth.uid() = user_id);
