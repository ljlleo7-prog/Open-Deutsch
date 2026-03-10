
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { generateConceptExercises } from '../src/lib/llm-generator.ts';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Starting exercise generation and upload...');
  
  // Fetch concepts from database
  console.log('Fetching lesson concepts from opendeutsch_lessons...');
  const { data: lessons, error: fetchError } = await supabase
    .from('opendeutsch_lessons')
    .select('concept, level');

  if (fetchError) {
    console.error('Failed to fetch lessons:', fetchError.message);
    process.exit(1);
  }

  if (!lessons || lessons.length === 0) {
    console.error('No lessons found in database.');
    process.exit(1);
  }

  // Deduplicate by concept and level
  const uniqueLessonPairs = lessons.reduce((acc, current) => {
    const key = `${current.concept}-${current.level}`;
    if (!acc.has(key)) {
      acc.set(key, { concept: current.concept, level: current.level });
    }
    return acc;
  }, new Map<string, { concept: string, level: string }>());

  console.log(`Found ${uniqueLessonPairs.size} unique concept/level pairs to process.`);

  for (const [key, { concept, level }] of uniqueLessonPairs) {
    console.log(`Processing: ${concept} (${level})...`);
    
    try {
      // 1. Check if we already have exercises for this concept/level to avoid duplicates
      const { count, error: countError } = await supabase
        .from('opendeutsch_exercises_database')
        .select('*', { count: 'exact', head: true })
        .eq('concept', concept)
        .eq('level', level);

      if (countError && countError.message.includes('not found')) {
        console.error('Table opendeutsch_exercises_database does not exist. Please create it first.');
        process.exit(1);
      }

      if (count && count >= 10) {
        console.log(`- Already have ${count} exercises for ${concept} (${level}). Skipping.`);
        continue;
      }

      const needed = 10 - (count || 0);
      console.log(`- Generating ${needed} exercises...`);
      const exercises = await generateConceptExercises(concept, level as any, needed);
      
      if (exercises.length > 0) {
        const { error: uploadError } = await supabase
          .from('opendeutsch_exercises_database')
          .upsert(
            exercises.map((ex, idx) => ({
              concept,
              level,
              prompt: ex.prompt,
              options: ex.options,
              answer: ex.answer,
              explanation: ex.explanation,
              metadata: { source: 'ollama', generated_at: new Date().toISOString() }
            })),
            { onConflict: 'concept,level,prompt' }
          );

        if (uploadError) {
          console.error(`- Error uploading ${concept} (${level}):`, uploadError.message);
        } else {
          console.log(`- Successfully uploaded ${exercises.length} exercises for ${concept} (${level})`);
        }
      }
    } catch (err) {
      console.error(`- Failed to process ${concept} (${level}):`, err);
    }
  }

  console.log('All done!');
}

main().catch(console.error);
