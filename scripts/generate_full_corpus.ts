
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { generateSentencesBatch, storeSentences } from '../src/lib/llm-generator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']; // Easy first, then hard
const BATCH_SIZE = 10;
const PROCESSED_VOCAB_FILE = path.join(__dirname, '../src/data/generated/processed_vocabulary.json');

interface ProcessedVocabItem {
  root: string;
  level: string;
  forms: string[];
  meaning: string;
}

async function getExistingWordsForLevel(level: string): Promise<Set<string>> {
  console.log(`Fetching existing words for level ${level}...`);
  
  // Fetch all vocab arrays for the given level
  // Note: This might be heavy if the DB gets very large, but fine for initial corpus generation
  const { data, error } = await supabase
    .from('opendeutsch_sentence_database')
    .select('vocab')
    .eq('level', level);

  if (error) {
    console.error('Error fetching existing words:', error);
    return new Set();
  }

  const existingWords = new Set<string>();
  
  if (data) {
    data.forEach((row: any) => {
      if (Array.isArray(row.vocab)) {
        row.vocab.forEach((word: string) => {
          if (typeof word === 'string') {
             existingWords.add(word.toLowerCase()); // Case-insensitive check?
             existingWords.add(word); // Also add exact match
          }
        });
      }
    });
  }

  console.log(`Found ${existingWords.size} unique words already covered for level ${level}.`);
  return existingWords;
}

async function main() {
  console.log('Starting full corpus generation...');
  
  // 1. Load Processed Vocabulary
  if (!fs.existsSync(PROCESSED_VOCAB_FILE)) {
    console.error(`Processed vocabulary file not found: ${PROCESSED_VOCAB_FILE}`);
    console.error('Please run "npx tsx scripts/classify_and_group_vocab.ts" first.');
    process.exit(1);
  }
  
  const rawData = fs.readFileSync(PROCESSED_VOCAB_FILE, 'utf-8');
  const processedVocabList: ProcessedVocabItem[] = JSON.parse(rawData);
  console.log(`Loaded ${processedVocabList.length} grouped words from processed vocabulary file.`);

  // 2. Iterate Levels (Easy -> Hard)
  for (const level of LEVELS) {
    console.log(`\n=== Processing Level: ${level} ===`);
    
    // Filter words by current level
    const levelWords = processedVocabList.filter(item => item.level === level);
    
    if (levelWords.length === 0) {
      console.log(`No words found for level ${level}. Skipping.`);
      continue;
    }

    // 3. Pruning: Filter out words that already have sentences
    const existingWords = await getExistingWordsForLevel(level);
    
    const wordsToProcess = levelWords.filter(item => {
      // Check if root word exists
      if (existingWords.has(item.root)) return false;
      
      // Check if any form exists (optional, but good for coverage)
      // for (const form of item.forms) {
      //   if (existingWords.has(form)) return false;
      // }
      
      return true;
    });

    console.log(`Level ${level}: ${wordsToProcess.length} words to process (out of ${levelWords.length}).`);

    if (wordsToProcess.length === 0) {
      console.log(`Level ${level} is complete. Skipping.`);
      continue;
    }

    // Batch Generation
    const totalBatches = Math.ceil(wordsToProcess.length / BATCH_SIZE);
    
    for (let i = 0; i < wordsToProcess.length; i += BATCH_SIZE) {
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const batch = wordsToProcess.slice(i, i + BATCH_SIZE);
      const vocabRoots = batch.map(w => w.root);
      
      console.log(`\nProcessing batch ${batchNum}/${totalBatches} for ${level}`);
      console.log(`Words: ${vocabRoots.join(', ')}`);
      
      try {
        const sentences = await generateSentencesBatch(vocabRoots.length, level as any, 'present', vocabRoots);
        
        if (sentences.length > 0) {
          await storeSentences(sentences);
          console.log(`Successfully stored ${sentences.length} sentences.`);
        } else {
          console.warn('No sentences generated for this batch.');
        }
        
      } catch (err) {
        console.error(`Error processing batch:`, err);
        // Continue to next batch despite error
      }
      
      console.log(`Finished batch ${batchNum}/${totalBatches} for ${level}.`);
      
      // Small delay to allow system to breathe / DB to sync
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\nFull corpus generation complete!');
}

main().catch(console.error);
