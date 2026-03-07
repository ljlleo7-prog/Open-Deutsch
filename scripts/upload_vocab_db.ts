
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

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

const PROCESSED_VOCAB_FILE = path.join(__dirname, '../src/data/generated/processed_vocabulary.json');

interface ProcessedVocabItem {
  root: string;
  level: string;
  forms: string[];
  meaning: string;
  type: string;
  details: any;
}

async function main() {
  console.log('Starting vocabulary upload...');

  if (!fs.existsSync(PROCESSED_VOCAB_FILE)) {
    console.error(`Processed vocabulary file not found: ${PROCESSED_VOCAB_FILE}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(PROCESSED_VOCAB_FILE, 'utf-8');
  let vocabList: ProcessedVocabItem[];
  
  try {
    vocabList = JSON.parse(rawData);
  } catch (e) {
    console.error('Failed to parse vocabulary JSON:', e);
    process.exit(1);
  }

  console.log(`Loaded ${vocabList.length} vocabulary items.`);

  // Chunking
  const BATCH_SIZE = 50;
  for (let i = 0; i < vocabList.length; i += BATCH_SIZE) {
    const batch = vocabList.slice(i, i + BATCH_SIZE);
    
    const { error } = await supabase
      .from('opendeutsch_vocab_database')
      .upsert(
        batch.map(item => ({
          root: item.root,
          meaning: item.meaning,
          level: item.level,
          type: item.type,
          details: item.details,
          forms: item.forms
        })),
        { onConflict: 'root', ignoreDuplicates: false }
      );

    if (error) {
      console.error(`Error uploading batch ${i/BATCH_SIZE + 1}:`, error);
    } else {
      console.log(`Uploaded batch ${i/BATCH_SIZE + 1}/${Math.ceil(vocabList.length / BATCH_SIZE)}`);
    }
  }

  console.log('Upload complete!');
}

main().catch(console.error);
