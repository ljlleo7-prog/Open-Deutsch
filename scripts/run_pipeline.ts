
import 'dotenv/config';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to run a script and stream output
function runScript(scriptName: string, args: string[] = []) {
  return new Promise<void>((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    console.log(`\n\n>>> Starting Step: ${scriptName} <<<\n`);
    
    // We use 'npx tsx' to execute the typescript files directly
    const child = spawn('npx', ['tsx', scriptPath, ...args], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env }
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n>>> Finished Step: ${scriptName} successfully. <<<\n`);
        resolve();
      } else {
        console.error(`\n>>> Step ${scriptName} failed with code ${code}. <<<\n`);
        reject(new Error(`Script ${scriptName} failed with code ${code}`));
      }
    });

    child.on('error', (err) => {
      console.error(`Failed to start script ${scriptName}:`, err);
      reject(err);
    });
  });
}

async function main() {
  console.log('================================================');
  console.log('       OPEN DEUTSCH DATA PIPELINE');
  console.log('================================================');
  console.log('This pipeline will:');
  console.log('1. Group, Classify, and Expand Vocabulary (using LLM)');
  console.log('2. Upload Processed Vocabulary to Supabase');
  console.log('3. Generate and Upload Sentences for Vocabulary (using LLM)');
  console.log('------------------------------------------------');

  try {
    // Step 0: Check/Generate Raw Vocabulary
    // The user requested approx 5000 words.
    // We check if we have enough vocab files or if we need to generate them.
    // For now, let's always run the generator if the user passed a flag, or just run it to be safe/sure we have 5000.
    // But generating 5000 words might take time to download/process? No, it's fast (dictionary lookup).
    // Let's run it.
    
    console.log('>>> Step 0: Generating Raw Vocabulary (approx 5000 words) <<<');
    const pythonScript = path.join(__dirname, 'build_datasets.py');
    const pythonArgs = ['--vocab-size', '5000'];
    const pythonCmd = 'python3'; 
    
    try {
      await new Promise<void>((resolve, reject) => {
          const child = spawn(pythonCmd, [pythonScript, ...pythonArgs], {
              stdio: 'inherit',
              shell: true
          });
          child.on('close', (code) => {
              if (code === 0) resolve();
              else reject(new Error(`Python script failed with code ${code}`));
          });
      });
      console.log('>>> Step 0 Completed Successfully. <<<\n');
    } catch (pythonError) {
       console.warn('>>> Warning: Step 0 (Python script) failed. Checking for existing vocabulary files... <<<');
       // Check if we have at least some vocab files
       const fs = await import('fs');
       const vocabDir = path.join(__dirname, '../src/data/generated');
       if (fs.existsSync(vocabDir)) {
           const files = fs.readdirSync(vocabDir).filter(f => f.startsWith('vocabulary-') && f.endsWith('.json'));
           if (files.length > 0) {
               console.log(`>>> Found ${files.length} existing vocabulary files. Proceeding with existing data. <<<\n`);
           } else {
               throw new Error('No vocabulary files found and Python generation script failed.');
           }
       } else {
           throw new Error('Vocabulary directory not found and Python generation script failed.');
       }
    }

    // Step 1: Group and Classify
    // This reads src/data/generated/vocabulary-*.json and outputs src/data/generated/processed_vocabulary.json
    await runScript('classify_and_group_vocab.ts');

    // Step 2: Upload Vocab
    // This uploads processed_vocabulary.json to opendeutsch_vocab_database
    await runScript('upload_vocab_db.ts');

    // Step 3: Generate Sentences
    // This reads processed_vocabulary.json, checks opendeutsch_sentence_database, and generates missing sentences
    // It also uploads them to opendeutsch_sentence_database
    await runScript('generate_full_corpus.ts');

    console.log('\n================================================');
    console.log('       PIPELINE COMPLETED SUCCESSFULLY');
    console.log('================================================');

  } catch (error) {
    console.error('\nPipeline execution failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
