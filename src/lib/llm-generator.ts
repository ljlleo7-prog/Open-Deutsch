import { supabase } from './supabase';
import { Level, GeneratedSentence } from '../types/generator-types';

// Define the structure for our stored sentence
export interface StoredSentence extends GeneratedSentence {
  id?: string;
  topic?: string;
  tense: string;
  difficulty: number;
  vocab: string[]; // List of main vocabulary words (lemmas)
  source: 'llm' | 'manual' | 'template';
}

const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

const BASE_URL = getEnv('VITE_OPENAI_BASE_URL') || getEnv('OPENAI_BASE_URL') || 'https://api.openai.com/v1';
const LLM_API_URL = `${BASE_URL.replace(/\/+$/, '')}/chat/completions`;

const API_KEY = getEnv('VITE_OPENAI_API_KEY') || getEnv('OPENAI_API_KEY');
const MODEL_NAME = getEnv('VITE_OPENAI_MODEL') || getEnv('OPENAI_MODEL') || 'gpt-3.5-turbo';

export async function generateSentencesBatch(
  count: number,
  level: Level,
  tense: string = 'present',
  vocabList?: string[],
  topic?: string
): Promise<StoredSentence[]> {
  console.log('Using LLM API URL:', LLM_API_URL);
  console.log('Using Model:', MODEL_NAME);

  if (!API_KEY && !LLM_API_URL.includes('localhost') && !LLM_API_URL.includes('127.0.0.1')) {
    console.warn('No LLM API Key found. Skipping LLM generation.');
    return [];
  }

  const prompt = `
    Generate ${count} distinct German sentences for level ${level}.
    Tense: ${tense}.
    ${topic ? `Topic: ${topic}.` : ''}
    ${vocabList ? `Create exactly one sentence for EACH of the following words: ${vocabList.join(', ')}.` : ''}
    
    Return ONLY a valid JSON array of objects with this structure:
    [
      {
        "german": "German sentence here",
        "english": "English translation here",
        "chinese": "Chinese translation here (Simplified Chinese characters, NO Pinyin)",
        "grammarFocus": "Main grammatical focus (e.g. 'Accusative', 'Modal Verb')",
        "structure": "Sentence structure (e.g. 'S-V-O')",
        "vocab": ["word1", "word2"],
        "difficulty": 1
      }
    ]
    Do not include any other text or markdown. valid JSON only.
  `;

  try {
    const response = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME, // Or gpt-4o
        messages: [
          { role: 'system', content: 'You are a German language teacher. Generate practice sentences with English and Simplified Chinese (Hanzi) translations. Output valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      if (response.status === 404 && (LLM_API_URL.includes('localhost') || LLM_API_URL.includes('127.0.0.1'))) {
        throw new Error(`LLM Model '${MODEL_NAME}' not found. Please run "ollama pull ${MODEL_NAME}" in your terminal.`);
      }
      throw new Error(`LLM API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from content (handle potential markdown blocks and extra text)
    let jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
    
    // Find the first '[' and last ']' to extract the JSON array
    const firstBracket = jsonStr.indexOf('[');
    const lastBracket = jsonStr.lastIndexOf(']');
    
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
    }
    
    // Attempt to fix common JSON errors from small models (e.g. trailing commas, unquoted keys)
    // This is a simple heuristic approach
    try {
      // Remove single-line comments (// ...)
      jsonStr = jsonStr.replace(/\/\/.*$/gm, '');
      // Remove trailing commas before closing braces/brackets
      jsonStr = jsonStr.replace(/,(\s*[\]}])/g, '$1');
    } catch (e) {
      // Ignore regex errors
    }
    
    const sentences = JSON.parse(jsonStr);

    // Map to StoredSentence structure
    return sentences.map((s: any) => ({
      ...s,
      parts: s.german.split(/\s+/).filter((p: string) => p.length > 0), // Programmatic word separation
      level,
      tense,
      topic,
      source: 'llm'
    }));

  } catch (error) {
    console.error('Failed to generate sentences via LLM:', error);
    return [];
  }
}

export async function storeSentences(sentences: StoredSentence[]) {
  if (sentences.length === 0) return;

  const { error } = await supabase
    .from('opendeutsch_sentence_database')
    .upsert(
      sentences.map(s => ({
        german: s.german,
        english: s.english,
        chinese: s.chinese,
        grammar_focus: s.grammarFocus,
        structure: s.structure,
        parts: s.parts,
        level: s.level,
        topic: s.topic,
        tense: s.tense,
        vocab: s.vocab,
        difficulty: s.difficulty,
        source: s.source,
        meta: s.meta
      })),
      { onConflict: 'german', ignoreDuplicates: true }
    );

  if (error) {
    console.error('Error storing sentences:', error);
  } else {
    console.log(`Successfully stored ${sentences.length} sentences.`);
  }
}

export async function getSentencesFromDB(
  level: Level,
  tense: string = 'present',
  limit: number = 1,
  topic?: string,
  vocabFilter?: string[]
): Promise<StoredSentence[]> {
  let query = supabase
    .from('opendeutsch_sentence_database')
    .select('*')
    .eq('level', level)
    .eq('tense', tense);

  if (topic) {
    query = query.eq('topic', topic);
  }

  if (vocabFilter && vocabFilter.length > 0) {
    // Check if the sentence vocab overlaps with the requested filter
    query = query.overlaps('vocab', vocabFilter);
  }

  const { data, error } = await query.limit(limit);

  if (error) {
    console.error('Error fetching sentences:', error);
    return [];
  }

  return data.map((row: any) => ({
    ...row,
    grammarFocus: row.grammar_focus,
    // Ensure types match GeneratedSentence
    parts: typeof row.parts === 'string' ? JSON.parse(row.parts) : row.parts,
    meta: typeof row.meta === 'string' ? JSON.parse(row.meta) : row.meta,
    vocab: typeof row.vocab === 'string' ? JSON.parse(row.vocab) : row.vocab
  }));
}

export async function getVocabForLevel(level: Level, limit: number = 20): Promise<any[]> {
  const { data, error } = await supabase
    .from('opendeutsch_vocab_database')
    .select('*')
    .eq('level', level)
    .limit(limit);
    
  if (error) {
    console.error('Error fetching vocab:', error);
    return [];
  }
  return data || [];
}

export async function getOrGenerateSentence(
  level: Level,
  tense: string = 'present',
  vocabList?: string[],
  topic?: string
): Promise<StoredSentence | null> {
  // 1. Try to fetch from DB
  const stored = await getSentencesFromDB(level, tense, 10, topic);
  
  if (stored.length > 0) {
    return stored[Math.floor(Math.random() * stored.length)];
  }

  // 2. If none, generate a batch
  console.log('No sentences found in DB, generating batch...');
  const generated = await generateSentencesBatch(5, level, tense, vocabList, topic);
  
  if (generated.length > 0) {
    // Store them in background
    storeSentences(generated);
    return generated[0];
  }

  return null;
}
