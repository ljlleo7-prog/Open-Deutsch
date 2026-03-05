-- Seed Stages for A1
DO $$
DECLARE
    a1_id TEXT := 'A1';
    stage1_id UUID := gen_random_uuid();
    stage2_id UUID := gen_random_uuid();
    lesson1_id TEXT := 'lesson-a1-s1-1';
    lesson2_id TEXT := 'lesson-a1-s1-2';
    lesson3_id TEXT := 'lesson-a1-s2-1';
BEGIN
    -- Insert Stages
    INSERT INTO public.opendeutsch_stages (id, level_id, title, description, order_index) VALUES
    (stage1_id, a1_id, 'Basics 1', 'Start with the absolute essentials.', 1),
    (stage2_id, a1_id, 'Common Phrases', 'Learn to greet and introduce yourself.', 2);

    -- Insert Lessons
    INSERT INTO public.opendeutsch_lessons (id, title, level, stage_id, type, description, order_index, concept, required_xp) VALUES
    (lesson1_id, 'Hello & Goodbye', 'A1', stage1_id, 'vocabulary', 'Learn basic greetings.', 1, 'greetings_vocab', 0),
    (lesson2_id, 'I am...', 'A1', stage1_id, 'grammar', 'The verb "sein" (to be).', 2, 'verb_sein', 0),
    (lesson3_id, 'Ordering Food', 'A1', stage2_id, 'sentence', 'How to order in a restaurant.', 1, 'ordering_food', 0);

    -- Insert Blocks (Optional, API handles generation if missing, but good to have structure)
    INSERT INTO public.opendeutsch_blocks (lesson_id, type, concept, order_index) VALUES
    (lesson1_id, 'vocabulary', 'basic_greetings', 1),
    (lesson1_id, 'multiple_choice', 'greetings_recognition', 2),
    (lesson1_id, 'sentence_reconstruction', 'simple_sentences', 3),
    
    (lesson2_id, 'grammar_cloze', 'sein_conjugation', 1),
    (lesson2_id, 'fill_blank', 'sein_usage', 2),
    (lesson2_id, 'sentence_writing', 'describe_self', 3),

    (lesson3_id, 'vocabulary', 'food_items', 1),
    (lesson3_id, 'multiple_choice', 'restaurant_phrases', 2),
    (lesson3_id, 'sentence_reconstruction', 'ordering_sentence', 3);

END $$;
