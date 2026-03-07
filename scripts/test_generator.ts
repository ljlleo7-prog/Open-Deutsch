
import { generateReadingText, generateExercises, generateSimpleSentence } from '../src/lib/generator';
import { wordPools, topicPools } from '../src/data/wordPools';

async function testGenerator() {
  console.log('--- Testing Generator ---');

  // Test 1: Vocabulary Pools
  console.log('\n1. Testing Vocabulary Pools...');
  console.log(`Subjects: ${wordPools.subjects.length}`);
  console.log(`Verbs: ${wordPools.verbs.length}`);
  console.log(`Objects: ${wordPools.objects.length}`);
  console.log(`Topic Pools: ${Object.keys(topicPools).join(', ')}`);

  // Test 2: Sentence Generation
  console.log('\n2. Testing Sentence Generation...');
  const sentenceA1 = generateSimpleSentence('A1');
  console.log(`A1 Sentence: ${sentenceA1.german} (${sentenceA1.english})`);
  
  const sentenceB1 = generateSimpleSentence('B1');
  console.log(`B1 Sentence: ${sentenceB1.german} (${sentenceB1.english})`);

  // Test 3: Reading Text Generation
  console.log('\n3. Testing Reading Text Generation...');
  try {
    const readingA1 = generateReadingText('history', 'A1');
    console.log(`A1 History Reading Title: ${readingA1.title}`);
    console.log(`A1 Word Count: ${readingA1.content.split(' ').length}`);
    console.log(`A1 Questions: ${readingA1.questions.length}`);

    const readingB1 = generateReadingText('aviation', 'B1');
    console.log(`B1 Aviation Reading Title: ${readingB1.title}`);
    console.log(`B1 Word Count: ${readingB1.content.split(' ').length}`);
    console.log(`B1 Questions: ${readingB1.questions.length}`);
  } catch (e) {
    console.error('Error generating reading:', e);
  }

  // Test 4: Exercise Generation
  console.log('\n4. Testing Exercise Generation...');
  try {
    const exercises = await generateExercises({ count: 3, level: 'A2', type: 'multiple_choice' });
    console.log(`Generated ${exercises.length} A2 exercises.`);
    console.log(`First exercise: ${exercises[0].prompt} -> ${exercises[0].answer}`);
  } catch (e) {
    console.error('Error generating exercises:', e);
  }

  console.log('\n--- Test Complete ---');
}

testGenerator().catch(console.error);
