
import 'dotenv/config'; // Load .env before other imports
import { generateExercises } from '../src/lib/generator';
import { resolve } from 'path';

async function testIntegration() {
  console.log('Testing generateExercises with Supabase integration...');
  try {
    const exercises = await generateExercises({ count: 2, level: 'A1', type: 'sentence_reconstruction' });
    console.log('Generated exercises:', JSON.stringify(exercises, null, 2));
    
    // Check if vocabulary came from Supabase
    // We can't easily check the source directly from the output, but if it runs without error, it's a good sign.
    // If we see vocabulary that is only in Supabase (or structured differently), that would confirm.
    // But for now, just running it is a good first step.
    
    if (exercises.length > 0) {
      console.log('Success: Exercises generated.');
    } else {
      console.error('Failure: No exercises generated.');
    }
  } catch (error) {
    console.error('Error running generateExercises:', error);
  }
}

testIntegration();
