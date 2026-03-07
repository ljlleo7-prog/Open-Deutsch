
import { generateSentencesBatch, storeSentences } from '../src/lib/llm-generator';
import { Level } from '../src/types/generator-types';

// Simple argument parsing
const args = process.argv.slice(2);
const count = parseInt(args[0] || '5', 10);
const level = (args[1] || 'A1') as Level;
const tense = args[2] || 'present';
const topic = args[3] || '';

async function main() {
  console.log(`Generating ${count} sentences for Level ${level}, Tense: ${tense}${topic ? `, Topic: ${topic}` : ''}...`);
  
  const sentences = await generateSentencesBatch(count, level, tense, undefined, topic);
  
  if (sentences.length > 0) {
    console.log(`Generated ${sentences.length} sentences.`);
    console.log('Sample:', sentences[0].german);
    
    await storeSentences(sentences);
    console.log('Done!');
  } else {
    console.log('No sentences generated. Check API key and logs.');
  }
}

main().catch(console.error);
