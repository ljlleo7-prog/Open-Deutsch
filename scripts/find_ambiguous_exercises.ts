
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

// We need to redefine wordPools here to avoid importing the whole app structure which might fail in standalone script
// or just read the file and parse it.
// Actually, let's try to import it if possible, but safer to copy the relevant lists since they are static.
// Wait, wordPools.ts is just data.
// But it imports types.
// Let's just define the lists we care about here to be safe and simple.

const LOCATIONS = [
  'Deutschland', 'Berlin', 'München', 'Hamburg', 'Frankfurt', 'Köln', 'Wien', 'Bern', 'Zürich', 
  'Schweiz', 'Österreich', 'Europa', 'Asien', 'Afrika', 'Amerika', 'Australien', 
  'Stadt', 'Land', 'Dorf', 'Haus', 'Wohnung', 'Zimmer', 'Küche', 'Bad', 'Schule', 'Universität',
  'Büro', 'Park', 'Markt', 'Bahnhof', 'Flughafen', 'Hotel', 'Restaurant', 'Cafe', 'Kino', 'Theater'
];

// Simple heuristic: if options contain multiple known locations, flag it.

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const LLM_API_URL = process.env.VITE_OPENAI_BASE_URL || process.env.OPENAI_BASE_URL || 'http://localhost:11434/v1';
const LLM_MODEL = process.env.VITE_OPENAI_MODEL || process.env.OPENAI_MODEL || 'llama3.1';
const LLM_API_KEY = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || 'ollama';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface ExerciseCandidate {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
}

async function checkAmbiguityBatch(candidates: ExerciseCandidate[]): Promise<{ id: string; ambiguous: boolean; reason: string }[]> {
  const fullUrl = `${LLM_API_URL.replace(/\/+$/, '')}/chat/completions`;
  
  const systemPrompt = `You are a strict logic checker for German language exercises.
Analyze the provided list of multiple-choice questions for ambiguity.
Task: For each question, determine if more than one option could be considered correct in a general context, or if the question is flawed/ambiguous.

Rules:
1. Ignore simple capitalization errors unless they change meaning.
2. Focus on semantic ambiguity (e.g., 'I live in ___' -> 'Berlin', 'Munich' are both valid completions if no other context).
3. If the prompt implies a specific translation (e.g. 'Translate: I live in Berlin' -> 'Ich wohne in ___'), then 'Berlin' is the only correct answer, so NOT ambiguous.
4. If the prompt is specific enough to rule out other options, it is NOT ambiguous.
5. If the question is a "fill in the blank" with a generic sentence (e.g. "Ich esse ___") and multiple options are valid completions (e.g. "Apfel", "Brot"), it IS ambiguous.
6. ONLY check for ambiguity between the provided options.

Input Format: JSON array of objects with { "id": "...", "prompt": "...", "options": [...], "answer": "..." }
Output Format: JSON array of objects with { "id": "...", "ambiguous": boolean, "reason": "short explanation" }`;

  const userPrompt = JSON.stringify(candidates);

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      console.warn(`LLM check failed: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    try {
      // Sometimes models wrap array in an object key like "results": [...]
      const json = JSON.parse(content);
      if (Array.isArray(json)) return json;
      if (json.results && Array.isArray(json.results)) return json.results;
      if (json.exercises && Array.isArray(json.exercises)) return json.exercises;
      
      // If just a single object returned (unlikely but possible if batch=1 or model fails instruction)
      if (json.id && typeof json.ambiguous === 'boolean') return [json];

      console.warn('Unexpected JSON structure:', content.slice(0, 100));
      return [];
    } catch (e) {
      console.warn('Failed to parse LLM response', content.slice(0, 100));
      return [];
    }
  } catch (e) {
    console.warn('LLM fetch error', e);
    return [];
  }
}

async function findAmbiguous() {
  console.log('Fetching exercises...');
  
  const { data: exercises, error } = await supabase
    .from('opendeutsch_exercises_database')
    .select('*');

  if (error) {
    console.error('Error fetching:', error);
    return;
  }

  console.log(`Found ${exercises.length} exercises.`);
  
  const exercisesToScan = exercises;
  const idsToDelete: string[] = [];
  
  // 1. Filter locally first
  const llmCandidates: ExerciseCandidate[] = [];

  for (const ex of exercisesToScan) {
    let options: string[] = [];
    if (typeof ex.options === 'string') {
      try {
        options = JSON.parse(ex.options);
      } catch {
        continue;
      }
    } else if (Array.isArray(ex.options)) {
      options = ex.options;
    } else {
      continue;
    }
    
    const prompt = ex.prompt || '';
    
    // Filter for likely sentence completion / grammar MCQs
    const isVocab = prompt.toLowerCase().includes('translate the word') || 
                    prompt.toLowerCase().includes('what is the german for') ||
                    prompt.toLowerCase().includes('meaning of');

    const isCloze = prompt.includes('____') || prompt.includes('...');
    const isMCQ = !isVocab;

    if (isMCQ && isCloze) {
        // Heuristic 1: Locations
        const locationMatches = options.filter(opt => 
            LOCATIONS.some(loc => opt.toLowerCase().includes(loc.toLowerCase()))
        );
        const isTranslation = prompt.toLowerCase().includes('translate') || prompt.toLowerCase().includes('english');
        
        if (!isTranslation) {
            if (locationMatches.length >= 2) {
                console.log(`[Heuristic] Ambiguous Location Exercise [${ex.id}]: "${prompt}" -> Options: [${options.join(', ')}]`);
                idsToDelete.push(ex.id);
                continue;
            }
            if (options.some(o => o.toLowerCase() === 'deutschland') && options.some(o => o.toLowerCase() === 'frankfurt')) {
                 console.log(`[Heuristic] Ambiguous D/F Exercise [${ex.id}]: "${prompt}" -> Options: [${options.join(', ')}]`);
                 idsToDelete.push(ex.id);
                 continue;
            }

            // Add to LLM batch queue
            llmCandidates.push({
              id: ex.id,
              prompt,
              options,
              answer: ex.answer
            });
        }
    }
  }

  console.log(`Found ${idsToDelete.length} ambiguous exercises via heuristics.`);
  console.log(`Queued ${llmCandidates.length} exercises for LLM check.`);

  // 2. Process in batches
  const BATCH_SIZE = 20;
  for (let i = 0; i < llmCandidates.length; i += BATCH_SIZE) {
    const batch = llmCandidates.slice(i, i + BATCH_SIZE);
    process.stdout.write(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(llmCandidates.length / BATCH_SIZE)}... `);
    
    const results = await checkAmbiguityBatch(batch);
    
    // Map results back
    for (const res of results) {
      if (res.ambiguous) {
        const candidate = batch.find(c => c.id === res.id);
        if (candidate) {
          console.log(`\n[LLM] Ambiguous [${res.id}]: ${res.reason}`);
          console.log(`Question: "${candidate.prompt}" -> Options: [${candidate.options.join(', ')}]`);
          idsToDelete.push(res.id);
        }
      }
    }
    process.stdout.write(`Done. (Found ${results.filter(r => r.ambiguous).length} ambiguous)\n`);
  }

  console.log(`Total ambiguous exercises to delete: ${idsToDelete.length}`);

  if (idsToDelete.length > 0) {
    console.log('Deleting ambiguous exercises...');
    const { error: deleteError } = await supabase
      .from('opendeutsch_exercises_database')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error('Error deleting:', deleteError);
    } else {
      console.log(`Successfully deleted ${idsToDelete.length} exercises.`);
    }

    const sql = `
-- Remove ambiguous exercises generated by scripts
DELETE FROM public.opendeutsch_exercises_database
WHERE id IN (
  ${idsToDelete.map(id => `'${id}'`).join(',\n  ')}
);
`;
    const outPath = path.join(process.cwd(), 'supabase', 'migrations', '20260310_remove_ambiguous_generic_exercises.sql');
    fs.writeFileSync(outPath, sql);
    console.log(`Migration written to ${outPath}`);
  } else {
    console.log('No ambiguous exercises found.');
  }
}

findAmbiguous();
