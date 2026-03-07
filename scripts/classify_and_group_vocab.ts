
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const VOCAB_DIR = path.join(__dirname, '../src/data/generated');
const OUTPUT_FILE = path.join(__dirname, '../src/data/generated/processed_vocabulary.json');
const LLM_API_URL = process.env.VITE_OPENAI_BASE_URL || 'http://127.0.0.1:11434/v1';
const API_KEY = process.env.VITE_OPENAI_API_KEY || 'ollama';
const MODEL_NAME = process.env.VITE_OPENAI_MODEL || 'mistral'; // Mistral is better for this task

interface VocabItem {
  de: string;
  en: string;
  [key: string]: any;
}

interface ProcessedVocabItem {
  root: string; // The base form / lemma
  level: string; // A1, A2, B1, B2, C1
  forms: string[]; // List of related forms found in input
  meaning: string; // English meaning of the root
  type: string; // Noun, Verb, Adjective, Other
  details: {
    gender?: string; // for nouns: m, f, n
    plural?: string; // for nouns
    present_3rd?: string; // for verbs: er/sie/es macht
    past_3rd?: string; // for verbs: er/sie/es machte
    perfect?: string; // for verbs: hat gemacht
  };
}

async function classifyAndGroupBatch(words: string[]): Promise<ProcessedVocabItem[]> {
  const prompt = `
    Analyze the following list of German words: ${JSON.stringify(words)}.
    
    Task:
    1. Group words that share the same root and basic meaning.
    2. Classify the CEFR difficulty level of the ROOT word.
    3. Provide the English meaning of the ROOT word.
    4. Identify the word type (Noun, Verb, Adjective, Other).
    5. Generate standard forms based on the type:
       - For Nouns: Gender (m, f, n) and Plural form.
       - For Verbs: 3rd Pers. Singular Present, 3rd Pers. Singular Past (Präteritum), and Perfect (Partizip II with aux verb).
    
    Return ONLY a valid JSON array of objects with this structure:
    [
      {
        "root": "base_word",
        "level": "A1",
        "forms": ["word_from_list_1", "word_from_list_2"],
        "meaning": "english_meaning",
        "type": "Noun" | "Verb" | "Adjective" | "Other",
        "details": {
          "gender": "m" | "f" | "n" | null,
          "plural": "PluralForm" | null,
          "present_3rd": "macht" | null,
          "past_3rd": "machte" | null,
          "perfect": "hat gemacht" | null
        }
      }
    ]
    
    Important:
    - "forms" must strictly contain only words from the provided input list.
    - "details" should contain generated standard forms even if they are NOT in the input list.
    - Valid JSON only, no markdown.
  `;

  try {
    const response = await fetch(`${LLM_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: 'You are a German linguist expert. Output valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1 // Low temperature for consistent classification
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API Error: ${response.statusText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Clean up JSON string
    content = content.replace(/```json\n?|\n?```/g, '').trim();
    
    // Simple heuristic to fix trailing commas or comments
    content = content.replace(/\/\/.*$/gm, ''); // Remove comments
    
    try {
        return JSON.parse(content);
    } catch (parseError) {
        console.error("JSON Parse Error. Content was:", content);
        return [];
    }

  } catch (error) {
    console.error('Classification failed:', error);
    return [];
  }
}

async function main() {
  console.log('Starting vocabulary classification and grouping...');

  // 1. Load all vocabulary
  if (!fs.existsSync(VOCAB_DIR)) {
    console.error(`Vocabulary directory not found: ${VOCAB_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(VOCAB_DIR).filter(file => file.startsWith('vocabulary-') && file.endsWith('.json'));
  let allWords: string[] = [];
  const seenWords = new Set<string>();

  for (const file of files) {
    const filePath = path.join(VOCAB_DIR, file);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const chunk: VocabItem[] = JSON.parse(rawData);
    
    chunk.forEach(item => {
      if (!seenWords.has(item.de)) {
        seenWords.add(item.de);
        allWords.push(item.de);
      }
    });
  }
  
  console.log(`Loaded ${allWords.length} unique words.`);

  // 2. Process in batches
  const BATCH_SIZE = 50; // Larger batch for classification
  let processedVocab: ProcessedVocabItem[] = [];
  
  // To avoid re-processing if script restarts, we could check for existing output file, 
  // but for now we'll start fresh or append logic could be added.

  for (let i = 0; i < allWords.length; i += BATCH_SIZE) {
    const batch = allWords.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allWords.length / BATCH_SIZE)}...`);
    
    const results = await classifyAndGroupBatch(batch);
    
    if (results.length > 0) {
        processedVocab.push(...results);
        console.log(`  > Classified ${results.length} groups.`);
    } else {
        console.warn(`  > Batch failed or returned empty.`);
        // Fallback: Add words individually as unknowns if LLM fails? 
        // For now, let's just log.
    }
    
    // Save intermediate results occasionally
    if (i % (BATCH_SIZE * 5) === 0) {
         fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processedVocab, null, 2));
         console.log(`  > Saved progress to ${OUTPUT_FILE}`);
    }
  }

  // 3. Final Save
  // Merge groups with same root if they appeared in different batches
  const finalMap = new Map<string, ProcessedVocabItem>();
  
  processedVocab.forEach(item => {
      const key = item.root.toLowerCase();
      if (finalMap.has(key)) {
          const existing = finalMap.get(key)!;
          // Merge forms
          const combinedForms = Array.from(new Set([...existing.forms, ...item.forms]));
          existing.forms = combinedForms;
      } else {
          finalMap.set(key, item);
      }
  });
  
  const finalVocab = Array.from(finalMap.values());
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalVocab, null, 2));
  console.log(`\nProcessing complete!`);
  console.log(`Original words: ${allWords.length}`);
  console.log(`Grouped roots: ${finalVocab.length}`);
  console.log(`Saved to: ${OUTPUT_FILE}`);
}

main().catch(console.error);
