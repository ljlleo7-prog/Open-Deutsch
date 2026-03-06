-- Seed Full Curriculum A0-B1
DO $$
DECLARE
    -- Levels
    l_a0 TEXT := 'A0';
    l_a1 TEXT := 'A1';
    l_a2 TEXT := 'A2';
    l_b1 TEXT := 'B1';

    -- Stage IDs (generated)
    s_a0_1 UUID := gen_random_uuid();
    s_a0_2 UUID := gen_random_uuid();
    s_a0_3 UUID := gen_random_uuid();

    s_a1_1 UUID := gen_random_uuid();
    s_a1_2 UUID := gen_random_uuid();
    s_a1_3 UUID := gen_random_uuid();
    s_a1_4 UUID := gen_random_uuid();
    s_a1_5 UUID := gen_random_uuid();

    s_a2_1 UUID := gen_random_uuid();
    s_a2_2 UUID := gen_random_uuid();
    s_a2_3 UUID := gen_random_uuid();
    s_a2_4 UUID := gen_random_uuid();
    s_a2_5 UUID := gen_random_uuid();
    s_a2_6 UUID := gen_random_uuid();

    s_b1_1 UUID := gen_random_uuid();
    s_b1_2 UUID := gen_random_uuid();
    s_b1_3 UUID := gen_random_uuid();
    s_b1_4 UUID := gen_random_uuid();
    s_b1_5 UUID := gen_random_uuid();
    s_b1_6 UUID := gen_random_uuid();

BEGIN
    -- Clear existing curriculum (optional, but good for clean state if needed, but be careful with foreign keys)
    -- DELETE FROM public.opendeutsch_lessons;
    -- DELETE FROM public.opendeutsch_stages;
    -- For now, we assume we are appending or that the previous seed was minimal. 
    -- Ideally we should use ON CONFLICT or check existence.
    -- But since we use random UUIDs for stages, we can't easily deduplicate by ID.
    -- We will rely on the fact that this is a fresh setup or we accept duplicates in dev.
    -- Actually, let's truncate for this task to ensure the view is clean.
    TRUNCATE TABLE public.opendeutsch_blocks CASCADE;
    TRUNCATE TABLE public.opendeutsch_lessons CASCADE;
    TRUNCATE TABLE public.opendeutsch_stages CASCADE;

    -- Re-insert Levels (if they don't exist)
    INSERT INTO public.opendeutsch_levels (id, name, description, total_xp_target, order_index) VALUES
    ('A0', 'Foundations', 'Basic sentence recognition and extremely simple production.', 500, 0),
    ('A1', 'Sentence Building', 'Construct everyday sentences.', 1500, 1),
    ('A2', 'Narrative', 'Read short texts and describe past events.', 3000, 2),
    ('B1', 'Intermediate', 'Analytical reading and flexible sentence structure.', 5000, 3)
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        total_xp_target = EXCLUDED.total_xp_target;

    -- A0 STAGES
    INSERT INTO public.opendeutsch_stages (id, level_id, title, description, order_index) VALUES
    (s_a0_1, l_a0, 'Basic Sentences', 'Alphabet, Pronouns, Sein, Haben', 1),
    (s_a0_2, l_a0, 'Basic Objects', 'Articles, Plurals, Numbers, Negation', 2),
    (s_a0_3, l_a0, 'Simple Actions', 'Present Tense, Questions, Prepositions', 3);

    -- A0 LESSONS
    INSERT INTO public.opendeutsch_lessons (id, stage_id, title, level, type, description, order_index, concept) VALUES
    -- Stage 1
    ('l-a0-s1-1', s_a0_1, 'German Alphabet', l_a0, 'vocabulary', 'Patterns: ch, sch, ie, ei', 1, 'alphabet'),
    ('l-a0-s1-2', s_a0_1, 'Personal Pronouns', l_a0, 'grammar', 'ich, du, er, sie, wir, ihr', 2, 'pronouns'),
    ('l-a0-s1-3', s_a0_1, 'Verb: sein', l_a0, 'grammar', 'To be (ich bin, du bist...)', 3, 'verb_sein'),
    ('l-a0-s1-4', s_a0_1, 'Verb: haben', l_a0, 'grammar', 'To have (ich habe, du hast...)', 4, 'verb_haben'),
    ('l-a0-s1-5', s_a0_1, 'Basic Statements', l_a0, 'sentence', 'Subject + Verb', 5, 'basic_statements'),
    -- Stage 2
    ('l-a0-s2-1', s_a0_2, 'Articles', l_a0, 'grammar', 'der, die, das', 1, 'articles_nom'),
    ('l-a0-s2-2', s_a0_2, 'Plural Nouns', l_a0, 'vocabulary', 'Common plural forms', 2, 'plurals'),
    ('l-a0-s2-3', s_a0_2, 'Numbers 0-20', l_a0, 'vocabulary', 'Counting basics', 3, 'numbers'),
    ('l-a0-s2-4', s_a0_2, 'Basic Nouns', l_a0, 'vocabulary', 'People, food, objects', 4, 'basic_nouns'),
    ('l-a0-s2-5', s_a0_2, 'Negation', l_a0, 'grammar', 'nicht vs kein', 5, 'negation'),
    -- Stage 3
    ('l-a0-s3-1', s_a0_3, 'Present Tense', l_a0, 'grammar', 'Regular verbs conjugation', 1, 'present_tense'),
    ('l-a0-s3-2', s_a0_3, 'Questions', l_a0, 'sentence', 'Verb first structure', 2, 'question_structure'),
    ('l-a0-s3-3', s_a0_3, 'Prepositions', l_a0, 'grammar', 'in, auf, mit', 3, 'prepositions_basic'),
    ('l-a0-s3-4', s_a0_3, 'Days & Time', l_a0, 'vocabulary', 'Days of week, time words', 4, 'days_time'),
    ('l-a0-s3-5', s_a0_3, 'Locations', l_a0, 'sentence', 'Simple location phrases', 5, 'locations');

    -- A1 STAGES
    INSERT INTO public.opendeutsch_stages (id, level_id, title, description, order_index) VALUES
    (s_a1_1, l_a1, 'Verb System', 'Conjugation, Modals', 1),
    (s_a1_2, l_a1, 'Sentence Structure', 'Word Order, Connectors', 2),
    (s_a1_3, l_a1, 'Objects & Cases', 'Accusative, Dative', 3),
    (s_a1_4, l_a1, 'Daily Life', 'Shopping, Travel, Routines', 4),
    (s_a1_5, l_a1, 'Reading & Expansion', 'Comprehension, Stories', 5);

    -- A1 LESSONS
    INSERT INTO public.opendeutsch_lessons (id, stage_id, title, level, type, description, order_index, concept) VALUES
    -- Stage 1
    ('l-a1-s1-1', s_a1_1, 'Regular Conjugation', l_a1, 'grammar', 'Standard verb endings', 1, 'regular_conjugation'),
    ('l-a1-s1-2', s_a1_1, 'Common Verbs', l_a1, 'vocabulary', 'gehen, machen, sehen...', 2, 'common_verbs'),
    ('l-a1-s1-3', s_a1_1, 'Modal: können', l_a1, 'grammar', 'Can/Able to', 3, 'modal_koennen'),
    ('l-a1-s1-4', s_a1_1, 'Modal: müssen', l_a1, 'grammar', 'Must/Have to', 4, 'modal_muessen'),
    ('l-a1-s1-5', s_a1_1, 'Modal: wollen', l_a1, 'grammar', 'Want to', 5, 'modal_wollen'),
    ('l-a1-s1-6', s_a1_1, 'Modal Structure', l_a1, 'sentence', 'Modal verb sentence frame', 6, 'modal_structure'),
    -- Stage 2
    ('l-a1-s2-1', s_a1_2, 'Word Order', l_a1, 'grammar', 'Verb second rule', 1, 'word_order_v2'),
    ('l-a1-s2-2', s_a1_2, 'Inversion', l_a1, 'sentence', 'Subject inversion', 2, 'subject_inversion'),
    ('l-a1-s2-3', s_a1_2, 'Separable Verbs', l_a1, 'grammar', 'Prefixes at end', 3, 'separable_verbs'),
    ('l-a1-s2-4', s_a1_2, 'Time Expressions', l_a1, 'vocabulary', 'Frequency and time', 4, 'time_expressions'),
    ('l-a1-s2-5', s_a1_2, 'Connectors', l_a1, 'grammar', 'und, aber', 5, 'connectors_coord'),
    ('l-a1-s2-6', s_a1_2, 'Weil Clause', l_a1, 'grammar', 'Basic because', 6, 'basic_weil'),
    -- Stage 3
    ('l-a1-s3-1', s_a1_3, 'Accusative Case', l_a1, 'grammar', 'Introduction to direct objects', 1, 'accusative_intro'),
    ('l-a1-s3-2', s_a1_3, 'Accusative Articles', l_a1, 'grammar', 'den, die, das', 2, 'accusative_articles'),
    ('l-a1-s3-3', s_a1_3, 'Direct Objects', l_a1, 'sentence', 'Using accusative', 3, 'direct_objects'),
    ('l-a1-s3-4', s_a1_3, 'Dative Case', l_a1, 'grammar', 'Introduction to indirect objects', 4, 'dative_intro'),
    ('l-a1-s3-5', s_a1_3, 'Dative Articles', l_a1, 'grammar', 'dem, der, den', 5, 'dative_articles'),
    ('l-a1-s3-6', s_a1_3, 'Dative Prepositions', l_a1, 'grammar', 'mit, bei, von...', 6, 'dative_preps'),
    ('l-a1-s3-7', s_a1_3, 'Accusative Prepositions', l_a1, 'grammar', 'für, ohne, gegen...', 7, 'accusative_preps'),
    -- Stage 4
    ('l-a1-s4-1', s_a1_4, 'Shopping', l_a1, 'vocabulary', 'Shopping phrases', 1, 'shopping'),
    ('l-a1-s4-2', s_a1_4, 'Restaurant', l_a1, 'vocabulary', 'Food and ordering', 2, 'restaurant'),
    ('l-a1-s4-3', s_a1_4, 'Transportation', l_a1, 'vocabulary', 'Vehicles and travel', 3, 'transport'),
    ('l-a1-s4-4', s_a1_4, 'Travel Sentences', l_a1, 'sentence', 'Booking and asking', 4, 'travel_sentences'),
    ('l-a1-s4-5', s_a1_4, 'Asking Info', l_a1, 'sentence', 'Where, When, How', 5, 'asking_info'),
    ('l-a1-s4-6', s_a1_4, 'Describing People', l_a1, 'vocabulary', 'Appearance and character', 6, 'describing_people'),
    ('l-a1-s4-7', s_a1_4, 'Routines', l_a1, 'sentence', 'Daily activities', 7, 'routines'),
    ('l-a1-s4-8', s_a1_4, 'Preferences', l_a1, 'sentence', 'Likes and dislikes', 8, 'preferences'),
    -- Stage 5
    ('l-a1-s5-1', s_a1_5, 'Paragraphs', l_a1, 'reading', 'Short comprehension', 1, 'paragraph_comp'),
    ('l-a1-s5-2', s_a1_5, 'Inference', l_a1, 'reading', 'Guessing words', 2, 'vocab_inference'),
    ('l-a1-s5-3', s_a1_5, 'Sentence Linking', l_a1, 'grammar', 'Connecting ideas', 3, 'sentence_linking'),
    ('l-a1-s5-4', s_a1_5, 'Comparisons', l_a1, 'grammar', 'Basic comparisons', 4, 'comparisons'),
    ('l-a1-s5-5', s_a1_5, 'Simple Story', l_a1, 'reading', 'Narrative practice', 5, 'simple_story'),
    ('l-a1-s5-6', s_a1_5, 'Transport Read', l_a1, 'reading', 'Topic: Transportation', 6, 'topic_transport'),
    ('l-a1-s5-7', s_a1_5, 'Sports Read', l_a1, 'reading', 'Topic: Sports', 7, 'topic_sports'),
    ('l-a1-s5-8', s_a1_5, 'Travel Read', l_a1, 'reading', 'Topic: Travel', 8, 'topic_travel');

    -- A2 STAGES
    INSERT INTO public.opendeutsch_stages (id, level_id, title, description, order_index) VALUES
    (s_a2_1, l_a2, 'Past Tense', 'Perfekt, Präteritum basics', 1),
    (s_a2_2, l_a2, 'Describing Things', 'Adjectives, Comparisons', 2),
    (s_a2_3, l_a2, 'Sentence Expansion', 'Subordinates, Reflexives', 3),
    (s_a2_4, l_a2, 'Communication', 'Opinions, Plans, Work', 4),
    (s_a2_5, l_a2, 'Reading Topics', 'Culture, News, Tech', 5),
    (s_a2_6, l_a2, 'Complex Sentences', 'Relative Clauses', 6);

    -- A2 LESSONS (Selected subset to keep file reasonable, but following structure)
    INSERT INTO public.opendeutsch_lessons (id, stage_id, title, level, type, description, order_index, concept) VALUES
    -- Stage 1
    ('l-a2-s1-1', s_a2_1, 'Perfekt Tense', l_a2, 'grammar', 'Formation basics', 1, 'perfekt_form'),
    ('l-a2-s1-2', s_a2_1, 'Haben vs Sein', l_a2, 'grammar', 'Auxiliary choice', 2, 'auxiliary_choice'),
    ('l-a2-s1-3', s_a2_1, 'Regular Participles', l_a2, 'grammar', 'ge-t form', 3, 'participles_reg'),
    ('l-a2-s1-4', s_a2_1, 'Irregular Participles', l_a2, 'vocabulary', 'Common irregularities', 4, 'participles_irreg'),
    ('l-a2-s1-5', s_a2_1, 'Past Expressions', l_a2, 'vocabulary', 'Yesterday, last week...', 5, 'past_expressions'),
    ('l-a2-s1-6', s_a2_1, 'Past Events', l_a2, 'sentence', 'Talking about history', 6, 'past_events'),
    ('l-a2-s1-7', s_a2_1, 'Sequencing', l_a2, 'sentence', 'First, then, after', 7, 'sequencing'),
    -- Stage 2
    ('l-a2-s2-1', s_a2_2, 'Adjectives', l_a2, 'grammar', 'Basic endings', 1, 'adjectives_basic'),
    ('l-a2-s2-2', s_a2_2, 'Comparatives', l_a2, 'grammar', 'Better, faster', 2, 'comparatives'),
    ('l-a2-s2-3', s_a2_2, 'Superlatives', l_a2, 'grammar', 'Best, fastest', 3, 'superlatives'),
    ('l-a2-s2-4', s_a2_2, 'Describing Places', l_a2, 'vocabulary', 'City and nature', 4, 'describing_places'),
    ('l-a2-s2-5', s_a2_2, 'Experiences', l_a2, 'sentence', 'Travel logs', 5, 'experiences'),
    -- Stage 3
    ('l-a2-s3-1', s_a2_3, 'Weil Clauses', l_a2, 'grammar', 'Subordinate word order', 1, 'weil_clauses'),
    ('l-a2-s3-2', s_a2_3, 'Dass Clauses', l_a2, 'grammar', 'That...', 2, 'dass_clauses'),
    ('l-a2-s3-3', s_a2_3, 'Wenn Clauses', l_a2, 'grammar', 'If/When...', 3, 'wenn_clauses'),
    ('l-a2-s3-4', s_a2_3, 'Reflexive Verbs', l_a2, 'grammar', 'sich waschen etc.', 4, 'reflexive_verbs'),
    -- Stage 5 (Reading)
    ('l-a2-s5-1', s_a2_5, 'Transport System', l_a2, 'reading', 'German transit', 1, 'read_transport'),
    ('l-a2-s5-2', s_a2_5, 'ICE Trains', l_a2, 'reading', 'High speed rail', 2, 'read_ice'),
    ('l-a2-s5-3', s_a2_5, 'Aviation', l_a2, 'reading', 'Flying intro', 3, 'read_aviation'),
    ('l-a2-s5-4', s_a2_5, 'News', l_a2, 'reading', 'Simplified news', 4, 'read_news'),
    -- Stage 6
    ('l-a2-s6-1', s_a2_6, 'Relative Clauses', l_a2, 'grammar', 'Introduction', 1, 'relative_clauses');

    -- B1 STAGES
    INSERT INTO public.opendeutsch_stages (id, level_id, title, description, order_index) VALUES
    (s_b1_1, l_b1, 'Advanced Grammar', 'Passive, Konjunktiv II', 1),
    (s_b1_2, l_b1, 'Argumentation', 'Opinions, Debate', 2),
    (s_b1_3, l_b1, 'Adv. Structure', 'Complex Chains, Connectors', 3),
    (s_b1_4, l_b1, 'Reading Analysis', 'Structure, Fact/Opinion', 4),
    (s_b1_5, l_b1, 'Topic Readings', 'History, Tech, Policy', 5),
    (s_b1_6, l_b1, 'Final Integration', 'Review & Exam Prep', 6);

    -- B1 LESSONS
    INSERT INTO public.opendeutsch_lessons (id, stage_id, title, level, type, description, order_index, concept) VALUES
    -- Stage 1
    ('l-b1-s1-1', s_b1_1, 'Passive Voice', l_b1, 'grammar', 'Introduction and usage', 1, 'passive_voice'),
    ('l-b1-s1-2', s_b1_1, 'Konjunktiv II', l_b1, 'grammar', 'Hypothetical situations', 2, 'konjunktiv_ii'),
    ('l-b1-s1-3', s_b1_1, 'Conditionals', l_b1, 'grammar', 'If I were...', 3, 'conditionals'),
    ('l-b1-s1-4', s_b1_1, 'Verb Prefixes', l_b1, 'vocabulary', 'Separable/Inseparable meanings', 4, 'verb_prefixes'),
    -- Stage 2
    ('l-b1-s2-1', s_b1_2, 'Opinions', l_b1, 'sentence', 'Meiner Meinung nach...', 1, 'opinions'),
    ('l-b1-s2-2', s_b1_2, 'Arguments', l_b1, 'sentence', 'Supporting points', 2, 'arguments'),
    ('l-b1-s2-3', s_b1_2, 'Debate', l_b1, 'vocabulary', 'Agree/Disagree', 3, 'debate'),
    -- Stage 3
    ('l-b1-s3-1', s_b1_3, 'Obwohl/Während', l_b1, 'grammar', 'Advanced connectors', 1, 'advanced_connectors'),
    ('l-b1-s3-2', s_b1_3, 'Complex Chains', l_b1, 'sentence', 'Multi-clause sentences', 2, 'complex_chains'),
    -- Stage 5
    ('l-b1-s5-1', s_b1_5, 'German History', l_b1, 'reading', 'Overview', 1, 'history_read'),
    ('l-b1-s5-2', s_b1_5, 'Technology', l_b1, 'reading', 'Tech and society', 2, 'tech_read'),
    ('l-b1-s5-3', s_b1_5, 'Transport Policy', l_b1, 'reading', 'Future of mobility', 3, 'policy_read'),
    ('l-b1-s5-4', s_b1_5, 'Aviation Industry', l_b1, 'reading', 'Business perspective', 4, 'aviation_biz');

END $$;
