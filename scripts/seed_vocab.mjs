import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const loadEnvFile = async () => {
  const envPath = path.resolve(__dirname, '../.env');
  try {
    const raw = await readFile(envPath, 'utf8');
    raw.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
      const [key, ...rest] = trimmed.split('=');
      const value = rest.join('=').trim();
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch {
    return;
  }
};

await loadEnvFile();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_ANON_KEY
  || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const COMPOUND_SUFFIXES = [
  'haus', 'hof', 'platz', 'straße', 'bahn', 'schule', 'zimmer', 'tag', 'zeit', 'stadt', 'buch', 'markt',
  'arbeit', 'weg', 'raum', 'dienst', 'welt', 'leben', 'geld', 'kultur', 'mann', 'frau', 'kind', 'land'
];

const isAllowedVocabularyWord = (value) => {
  if (!value) return false;
  if (value.includes(' ') || value.includes('-') || value.includes('.') || value.includes(',')) return false;
  if (/\d/.test(value)) return false;
  if (!/^[A-Za-zÄÖÜäöüß]+$/.test(value)) return false;
  const normalized = value.toLowerCase();
  if (normalized.length <= 12) return true;
  if (normalized.length > 20) return false;
  return COMPOUND_SUFFIXES.some(suffix => normalized.endsWith(suffix));
};

const difficultyScore = (entry) => {
  const de = entry.de || '';
  const en = entry.en || '';
  const avgLength = (de.length + en.length) / 2;
  const umlautPenalty = /[äöüß]/i.test(de) ? 1.2 : 0;
  const clusterPenalty = /[bcdfghjklmnpqrstvwxyz]{3,}/i.test(de) ? 1.2 : 0;
  return avgLength + umlautPenalty + clusterPenalty;
};

const levelMaxScore = {
  A0: 6,
  A1: 8,
  A2: 10,
  B1: 12
};

const classifyLevel = (entry) => {
  const score = difficultyScore(entry);
  if (score <= levelMaxScore.A0) return 'A0';
  if (score <= levelMaxScore.A1) return 'A1';
  if (score <= levelMaxScore.A2) return 'A2';
  return 'B1';
};

const buildExample = (entry) => ({
  example_de: `Ich lerne das Wort "${entry.de}".`,
  example_en: `I am learning the word "${entry.en}".`
});

const dataDir = path.resolve(__dirname, '../src/data/generated');
const files = [
  'vocabulary-0000.json',
  'vocabulary-0001.json',
  'vocabulary-0002.json',
  'vocabulary-0003.json',
  'vocabulary-0004.json',
  'vocabulary-0005.json',
  'vocabulary-0006.json',
  'vocabulary-0007.json'
];

const vocab = [];
for (const file of files) {
  const text = await readFile(path.join(dataDir, file), 'utf8');
  vocab.push(...JSON.parse(text));
}

const rows = vocab
  .filter(item => isAllowedVocabularyWord(item.de))
  .map(item => ({
    root: item.de,
    meaning: item.en,
    level: classifyLevel(item),
    type: item.pos || 'noun',
    details: {
      gender: item.gender || null,
      plural: item.plural || null,
      genitive: item.genitive || null,
      ipa: item.ipa || null,
      en_variants: item.en_variants || [],
      zh: item.zh || [],
      ...buildExample(item)
    }
  }));

const batchSize = 500;
for (let i = 0; i < rows.length; i += batchSize) {
  const batch = rows.slice(i, i + batchSize);
  const { error } = await supabase
    .from('opendeutsch_vocab_database')
    .upsert(batch, { onConflict: 'root' });
  if (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
  console.log(`Seeded ${Math.min(i + batch.length, rows.length)} / ${rows.length}`);
}
