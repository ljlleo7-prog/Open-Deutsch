
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1'); // Remove quotes if present
      process.env[key] = value;
    }
  });
}

import { Level } from '../src/types/generator-types';

// We'll read the JSON file directly using fs to avoid TS import issues in script execution context if any
const vocabPath = path.join(process.cwd(), 'src/data/generated/vocabulary-0000.json');

interface VocabItem {
  de: string;
  en: string;
  pos?: string;
}

async function main() {
  // Dynamic import to ensure env vars are loaded first
  const { generateSentencesBatch, storeSentences } = await import('../src/lib/llm-generator');

  console.log('Starting vocabulary iteration test...');

  if (!fs.existsSync(vocabPath)) {
    console.error(`Vocabulary file not found at: ${vocabPath}`);
    process.exit(1);
  }

  const vocabData: VocabItem[] = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));
  
  // Pick 20 words. Let's filter for nouns or verbs to make sentences more interesting, 
  // or just take the first 20 non-empty ones.
  // "Aachen" is a city, "Aber" is a conjunction.
  // Let's try to pick a mix or just the first 20.
  // User said "iterate the vocab list for ~20", implies sequential or random sample.
  // Let's take a slice of 20 items from index 0.
  const testBatch = vocabData.slice(0, 20);

  console.log(`Selected ${testBatch.length} words for testing:`);
  console.log(testBatch.map(v => v.de).join(', '));

  let totalGenerated = 0;
  // Batch size 5 is more stable for small models like gemma:2b. 
  // Larger models (llama3, mistral) can handle 10+.
  const BATCH_SIZE = 10;

  for (let i = 0; i < testBatch.length; i += BATCH_SIZE) {
    const wordBatch = testBatch.slice(i, i + BATCH_SIZE);
    const vocabList = wordBatch.map(w => w.de);
    
    console.log(`\nGenerating sentences for batch ${i / BATCH_SIZE + 1} (words: ${vocabList.join(', ')})...`);
    
    // Request 1 sentence per word in the batch
    const sentences = await generateSentencesBatch(wordBatch.length, 'A1', 'present', vocabList);
    
    if (sentences.length > 0) {
      console.log(`  > Generated ${sentences.length} sentences.`);
      if (sentences.length > 0) {
         console.log(`  > Sample: ${sentences[0].german}`);
         console.log(`    English: ${sentences[0].english}`);
         console.log(`    Chinese: ${sentences[0].chinese}`);
         console.log(`    Grammar: ${sentences[0].grammarFocus}`);
         console.log(`    Structure: ${sentences[0].structure}`);
         console.log(`    Parts: ${JSON.stringify(sentences[0].parts)}`);
      }
      
      // Store immediately
      try {
        await storeSentences(sentences);
        totalGenerated += sentences.length;
      } catch (err) {
        console.error('  > Error storing sentences (skipping storage):', err);
      }
    } else {
      console.log(`  > Failed to generate sentences for batch.`);
    }

    // Small delay to avoid hitting rate limits too hard
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\nTest complete! Total sentences generated and stored: ${totalGenerated}`);
}

main().catch(console.error);
