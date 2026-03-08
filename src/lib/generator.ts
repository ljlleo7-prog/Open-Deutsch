import { wordPools, conjugations, pastConjugations, topicPools } from '../data/wordPools';
import { Topic } from '../types';
import vocab0000 from '../data/generated/vocabulary-0000.json';
import vocab0001 from '../data/generated/vocabulary-0001.json';
import vocab0002 from '../data/generated/vocabulary-0002.json';
import vocab0003 from '../data/generated/vocabulary-0003.json';
import vocab0004 from '../data/generated/vocabulary-0004.json';
import vocab0005 from '../data/generated/vocabulary-0005.json';
import vocab0006 from '../data/generated/vocabulary-0006.json';
import vocab0007 from '../data/generated/vocabulary-0007.json';
// import readingsData from '../data/generated/readings.json'; // Removed to avoid bundling
import { Level, GeneratedSentence } from '../types/generator-types';
import { getOrGenerateSentence, getSentencesFromDB, getVocabForLevel } from './llm-generator';
import { supabase } from './supabase';

export type { Level, GeneratedSentence };

export type ExerciseType =
  | 'sentence_reconstruction'
  | 'multiple_choice'
  | 'fill_blank'
  | 'vocabulary'
  | 'tense'
  | 'sentence_writing'
  | 'word_order'
  | 'grammar_cloze'
  | 'vocabulary_matching';

export interface GeneratedText {
  id: string;
  title: string;
  content: string;
  topic: Topic;
  level?: Level;
  complexity_score?: number;
  source?: {
    name: string;
    url: string;
  };
  published_at?: string;
  vocabulary?: {
    word: string;
    translation: string;
    pos?: string;
    definition?: string;
  }[];
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}

export interface ExerciseItem {
  id: string;
  type: ExerciseType;
  level: Level;
  prompt: string;
  promptSecondary?: string;
  options?: string[];
  answer: string;
  sentence?: GeneratedSentence;
  targetTense?: 'present' | 'past';
  pairs?: { left: string; right: string }[];
}

export type VocabularyEntry = {
  de: string;
  en: string;
  en_variants?: string[];
  zh?: string[];
  pos?: string;
  gender?: string;
  plural?: string;
  genitive?: string;
  ipa?: string[];
};

export type VocabularyCard = {
  id: string;
  word: VocabularyEntry;
  example: {
    de: string;
    en: string;
  };
  level: Level;
  topic?: Topic;
  source: 'remote' | 'local';
};

type LocalReading = {
  id: string;
  title: string;
  content: string;
  topic: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
};

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

const LOCAL_VOCAB_LIMIT = 1000;
const LOCAL_VOCAB: VocabularyEntry[] = [
  ...(vocab0000 as VocabularyEntry[]),
  ...(vocab0001 as VocabularyEntry[]),
  ...(vocab0002 as VocabularyEntry[]),
  ...(vocab0003 as VocabularyEntry[]),
  ...(vocab0004 as VocabularyEntry[]),
  ...(vocab0005 as VocabularyEntry[]),
  ...(vocab0006 as VocabularyEntry[]),
  ...(vocab0007 as VocabularyEntry[])
];

// const LOCAL_READINGS = readingsData as LocalReading[]; // Removed

const COMPOUND_SUFFIXES = [
  'haus', 'hof', 'platz', 'straße', 'bahn', 'schule', 'zimmer', 'tag', 'zeit', 'stadt', 'buch', 'markt',
  'arbeit', 'weg', 'raum', 'dienst', 'welt', 'leben', 'geld', 'kultur', 'mann', 'frau', 'kind', 'land'
];

const isAllowedVocabularyWord = (value: string) => {
  if (!value) return false;
  if (value.includes(' ') || value.includes('-') || value.includes('.') || value.includes(',')) return false;
  if (/\d/.test(value)) return false;
  if (!/^[A-Za-zÄÖÜäöüß]+$/.test(value)) return false;
  const normalized = value.toLowerCase();
  if (normalized.length <= 12) return true;
  if (normalized.length > 20) return false;
  return COMPOUND_SUFFIXES.some(suffix => normalized.endsWith(suffix));
};

const normalizeWord = (value: string) => value.toLowerCase();

const buildVocabIndex = (items: VocabularyEntry[]) => {
  const map = new Map<string, VocabularyEntry>();
  for (const item of items) {
    map.set(normalizeWord(item.de), item);
  }
  return map;
};

const buildVocabEnIndex = (items: VocabularyEntry[]) => {
  const map = new Map<string, VocabularyEntry[]>();
  for (const item of items) {
    const values = [item.en, ...(item.en_variants || [])].filter(Boolean);
    for (const value of values) {
      const key = normalizeWord(value);
      const list = map.get(key) || [];
      list.push(item);
      map.set(key, list);
    }
  }
  return map;
};

const LOCAL_VOCAB_POOL = LOCAL_VOCAB.filter(item => isAllowedVocabularyWord(item.de)).slice(0, LOCAL_VOCAB_LIMIT);
const LOCAL_VOCAB_INDEX = buildVocabIndex(LOCAL_VOCAB_POOL);
const LOCAL_VOCAB_EN_INDEX = buildVocabEnIndex(LOCAL_VOCAB_POOL);

const pickRandomItems = <T,>(items: T[], count: number) => {
  if (items.length <= count) return [...items];
  const shuffled = shuffleArray(items);
  return shuffled.slice(0, count);
};

const difficultyScore = (entry: VocabularyEntry) => {
  const de = entry.de || '';
  const en = entry.en || '';
  const avgLength = (de.length + en.length) / 2;
  const umlautPenalty = /[äöüß]/i.test(de) ? 1.2 : 0;
  const clusterPenalty = /[bcdfghjklmnpqrstvwxyz]{3,}/i.test(de) ? 1.2 : 0;
  return avgLength + umlautPenalty + clusterPenalty;
};

const levelMaxScore: Record<Level, number> = {
  A0: 6,
  A1: 8,
  A2: 10,
  B1: 12
};

const getLocalVocabularyForLevel = (level: Level) => {
  let maxScore = levelMaxScore[level];
  let filtered = LOCAL_VOCAB_POOL.filter(item => difficultyScore(item) <= maxScore);
  if (level === 'A0') {
    return filtered.length > 0 ? filtered : LOCAL_VOCAB_POOL;
  }
  while (filtered.length < 200 && maxScore <= 14) {
    maxScore += 1;
    filtered = LOCAL_VOCAB_POOL.filter(item => difficultyScore(item) <= maxScore);
  }
  return filtered.length > 0 ? filtered : LOCAL_VOCAB_POOL;
};

const normalizeEnglish = (value: string) => value.toLowerCase().replace(/[^a-z]/g, '');

const buildBigrams = (value: string) => {
  const normalized = normalizeEnglish(value);
  const grams: string[] = [];
  for (let i = 0; i < normalized.length - 1; i += 1) {
    grams.push(normalized.slice(i, i + 2));
  }
  return grams;
};

const similarityScore = (a: string, b: string) => {
  const aGrams = buildBigrams(a);
  const bGrams = buildBigrams(b);
  if (aGrams.length === 0 || bGrams.length === 0) return 0;
  const aSet = new Set(aGrams);
  const bSet = new Set(bGrams);
  const intersection = Array.from(aSet).filter(item => bSet.has(item)).length;
  const union = new Set([...aSet, ...bSet]).size;
  const prefixBonus = normalizeEnglish(a).slice(0, 2) === normalizeEnglish(b).slice(0, 2) ? 0.2 : 0;
  const lengthBonus = Math.abs(a.length - b.length) <= 2 ? 0.1 : 0;
  return intersection / union + prefixBonus + lengthBonus;
};

const pickSimilarWords = (correct: string, pool: string[], count: number) => {
  const unique = Array.from(new Set(pool.filter(item => item && item !== correct)));
  const ranked = unique
    .map(item => ({ item, score: similarityScore(correct, item) }))
    .sort((a, b) => b.score - a.score);
  const similar = ranked.filter(item => item.score > 0.15).map(item => item.item);
  const picked = similar.slice(0, count);
  if (picked.length >= count) return picked;
  const fallback = unique.filter(item => !picked.includes(item));
  return [...picked, ...pickRandomItems(fallback, count - picked.length)];
};

const pickClosestWords = (correct: string, pool: string[], count: number, minScore = 0.25) => {
  const unique = Array.from(new Set(pool.filter(item => item && item !== correct)));
  const ranked = unique
    .map(item => ({ item, score: similarityScore(correct, item) }))
    .sort((a, b) => b.score - a.score);
  const strong = ranked.filter(item => item.score >= minScore).map(item => item.item);
  const lengthMatch = unique.filter(item => Math.abs(item.length - correct.length) <= 2);
  const prefixMatch = unique.filter(item => item[0]?.toLowerCase() === correct[0]?.toLowerCase());
  const merged = Array.from(new Set([...strong, ...prefixMatch, ...lengthMatch]));
  const picked = merged.slice(0, count);
  if (picked.length >= count) return picked;
  const fallback = ranked.map(item => item.item).filter(item => !picked.includes(item));
  return [...picked, ...fallback.slice(0, count - picked.length)];
};

const extractNouns = (content: string) => {
  const matches = content.match(/\b[A-ZÄÖÜ][a-zäöüß]{2,}\b/g) ?? [];
  return Array.from(new Set(matches)).filter(isAllowedVocabularyWord);
};

function getLevelConfig(level: Level) {
  return {
    includeLocation: level !== 'A0',
    includeAdjective: level === 'A2' || level === 'B1',
    includeAdverb: level === 'B1'
  };
}

function getIndefiniteArticle(gender: 'm' | 'f' | 'n', caseType: string): string {
  if (caseType === 'nominative') {
    if (gender === 'm') return 'ein';
    if (gender === 'f') return 'eine';
    if (gender === 'n') return 'ein';
  }
  if (caseType === 'accusative') {
    if (gender === 'm') return 'einen';
    if (gender === 'f') return 'eine';
    if (gender === 'n') return 'ein';
  }
  if (caseType === 'dative') {
    if (gender === 'm') return 'einem';
    if (gender === 'f') return 'einer';
    if (gender === 'n') return 'einem';
  }
  return 'ein';
}

function getAdjectiveEnding(gender: 'm' | 'f' | 'n', caseType: string): string {
  if (caseType === 'nominative') {
    if (gender === 'm') return 'er';
    if (gender === 'f') return 'e';
    if (gender === 'n') return 'es';
  }
  if (caseType === 'accusative') {
    if (gender === 'm') return 'en';
    if (gender === 'f') return 'e';
    if (gender === 'n') return 'es';
  }
  if (caseType === 'dative') {
    return 'en';
  }
  return '';
}

const levelOrder: Record<Level, number> = { A0: 0, A1: 1, A2: 2, B1: 3 };

const filterByLevel = <T extends { level?: Level }>(items: T[], level: Level) =>
  items.filter(item => !item.level || levelOrder[item.level] <= levelOrder[level]);

type VerbGroupKey = 'travel' | 'eat' | 'drink' | 'have' | 'be' | 'learn' | 'see' | 'read';
type ObjectGroupKey = 'food' | 'drink' | 'item' | 'person' | 'language' | 'vehicle' | 'media';
type SentenceTemplate = {
  id: string;
  verbGroup: VerbGroupKey;
  objectGroup?: ObjectGroupKey;
  useLocation?: boolean;
  allowAdverb?: boolean;
};

const verbGroupMap: Record<VerbGroupKey, string[]> = {
  travel: ['gehen', 'kommen', 'fahren', 'reisen', 'wohnen', 'arbeiten'],
  eat: ['essen', 'kochen'],
  drink: ['trinken'],
  have: ['haben', 'kaufen', 'nehmen', 'brauchen', 'möchten'],
  be: ['sein'],
  learn: ['lernen', 'sprechen'],
  see: ['sehen', 'besuchen'],
  read: ['lesen', 'schreiben']
};

const objectGroupCategories: Record<ObjectGroupKey, string[]> = {
  food: ['food'],
  drink: ['drink'],
  item: ['item'],
  person: ['person'],
  language: ['language'],
  vehicle: ['vehicle'],
  media: ['media']
};

const getVerbGroup = (key: VerbGroupKey) => {
  const pool = wordPools.verbs.filter(item => verbGroupMap[key].includes(item.infinitive || ''));
  return pool.length > 0 ? pool : wordPools.verbs;
};

const getObjectGroup = (key: ObjectGroupKey) => {
  const categories = objectGroupCategories[key];
  const pool = wordPools.objects.filter(item => categories.includes(item.category || ''));
  if (key === 'person') {
    const subjectNouns = wordPools.subjects
      .filter(item => item.type === 'noun')
      .map(item => ({ ...item, category: 'person' }));
    const combined = [...pool, ...subjectNouns];
    return combined.length > 0 ? combined : wordPools.objects;
  }
  return pool.length > 0 ? pool : wordPools.objects;
};

const templatesByLevel: Record<Level, SentenceTemplate[]> = {
  A0: [
    { id: 'travel_location', verbGroup: 'travel', useLocation: true },
    { id: 'eat_food', verbGroup: 'eat', objectGroup: 'food' },
    { id: 'drink', verbGroup: 'drink', objectGroup: 'drink' },
    { id: 'have_item', verbGroup: 'have', objectGroup: 'item' },
    { id: 'be_person', verbGroup: 'be', objectGroup: 'person' },
    { id: 'learn_language', verbGroup: 'learn', objectGroup: 'language' }
  ],
  A1: [
    { id: 'travel_location', verbGroup: 'travel', useLocation: true },
    { id: 'eat_food', verbGroup: 'eat', objectGroup: 'food' },
    { id: 'drink', verbGroup: 'drink', objectGroup: 'drink' },
    { id: 'have_item', verbGroup: 'have', objectGroup: 'item' },
    { id: 'have_person', verbGroup: 'have', objectGroup: 'person' },
    { id: 'see_person', verbGroup: 'see', objectGroup: 'person' },
    { id: 'read_media', verbGroup: 'read', objectGroup: 'media' },
    { id: 'learn_language', verbGroup: 'learn', objectGroup: 'language' }
  ],
  A2: [
    { id: 'travel_location', verbGroup: 'travel', useLocation: true, allowAdverb: true },
    { id: 'eat_food', verbGroup: 'eat', objectGroup: 'food', allowAdverb: true },
    { id: 'drink', verbGroup: 'drink', objectGroup: 'drink', allowAdverb: true },
    { id: 'have_item', verbGroup: 'have', objectGroup: 'item', allowAdverb: true },
    { id: 'have_person', verbGroup: 'have', objectGroup: 'person', allowAdverb: true },
    { id: 'see_person', verbGroup: 'see', objectGroup: 'person', allowAdverb: true },
    { id: 'read_media', verbGroup: 'read', objectGroup: 'media', allowAdverb: true },
    { id: 'learn_language', verbGroup: 'learn', objectGroup: 'language', allowAdverb: true }
  ],
  B1: [
    { id: 'travel_location', verbGroup: 'travel', useLocation: true, allowAdverb: true },
    { id: 'eat_food', verbGroup: 'eat', objectGroup: 'food', allowAdverb: true },
    { id: 'drink', verbGroup: 'drink', objectGroup: 'drink', allowAdverb: true },
    { id: 'have_item', verbGroup: 'have', objectGroup: 'item', allowAdverb: true },
    { id: 'have_person', verbGroup: 'have', objectGroup: 'person', allowAdverb: true },
    { id: 'see_person', verbGroup: 'see', objectGroup: 'person', allowAdverb: true },
    { id: 'read_media', verbGroup: 'read', objectGroup: 'media', allowAdverb: true },
    { id: 'learn_language', verbGroup: 'learn', objectGroup: 'language', allowAdverb: true }
  ]
};

const buildTemplateSentence = (level: Level, topic?: Topic, contextVocab?: VocabularyEntry[]): GeneratedSentence => {
  const pool = topic ? topicPools[topic] : null;
  const template = getRandomItem(templatesByLevel[level] || templatesByLevel.A1);

  const subjectPool = filterByLevel(pool?.subjects ?? wordPools.subjects, level);
  const subject = getRandomItem(subjectPool.length > 0 ? subjectPool : wordPools.subjects);

  const verbCandidates = filterByLevel(getVerbGroup(template.verbGroup), level);
  const verbBase = getRandomItem(verbCandidates.length > 0 ? verbCandidates : wordPools.verbs);
  const personKey = `${subject.person || 3}${subject.number === 'singular' ? 's' : 'p'}`;
  const verbConjugations = conjugations[verbBase.infinitive || ''];
  const conjugatedVerb = verbConjugations?.[personKey] || verbBase.de;

  const objectCandidates = template.objectGroup
    ? filterByLevel(getObjectGroup(template.objectGroup), level)
    : [];
  const contextEntry = contextVocab && contextVocab.length > 0 ? getRandomItem(contextVocab) : null;
  const objectBase = template.objectGroup
    ? objectCandidates.length > 0
      ? getRandomItem(objectCandidates)
      : contextEntry
        ? {
            de: contextEntry.de,
            en: contextEntry.en,
            gender: contextEntry.gender as 'm' | 'f' | 'n' | undefined,
            category: 'context'
          }
        : null
    : null;

  const { includeAdjective, includeAdverb } = getLevelConfig(level);
  const adjectivePool = filterByLevel(wordPools.adjectives, level);
  const adverbPool = filterByLevel(wordPools.adverbs, level);
  const locationPool = filterByLevel(wordPools.locations, level);
  const adjective = includeAdjective && objectBase?.gender && adjectivePool.length > 0
    ? getRandomItem(adjectivePool)
    : null;
  const adverb = template.allowAdverb && includeAdverb && adverbPool.length > 0 ? getRandomItem(adverbPool) : null;
  const location = template.useLocation && locationPool.length > 0 ? getRandomItem(locationPool) : null;

  const targetCase = verbBase.case || 'accusative';
  let objectDe = objectBase?.de || '';

  if (objectBase?.gender && (targetCase === 'accusative' || targetCase === 'dative' || targetCase === 'nominative')) {
    const parts = objectBase.de.split(' ');
    const firstWord = parts[0].toLowerCase();
    const isIndefinite = ['ein', 'eine', 'einen'].includes(firstWord);
    if (isIndefinite || parts.length === 2) {
      const noun = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];
      const newArticle = getIndefiniteArticle(objectBase.gender, targetCase);
      if (adjective) {
        const ending = getAdjectiveEnding(objectBase.gender, targetCase);
        objectDe = `${newArticle} ${adjective.de}${ending} ${noun}`;
      } else {
        objectDe = `${newArticle} ${noun}`;
      }
    }
  } else if (adjective && objectBase) {
    objectDe = `${adjective.de} ${objectBase.de}`;
  }

  const objectEn = objectBase ? (adjective ? `${adjective.en} ${objectBase.en}` : objectBase.en) : '';
  const germanParts = [
    subject.de,
    conjugatedVerb,
    adverb?.de,
    objectDe,
    location?.de
  ].filter(Boolean) as string[];
  const germanSentence = `${germanParts.join(' ')}.`;
  const englishVerb = buildEnglishVerb(subject, verbBase);
  const englishParts = [
    subject.en,
    englishVerb,
    adverb?.en,
    objectEn,
    location?.en
  ].filter(Boolean) as string[];
  const englishSentence = `${englishParts.join(' ')}.`;

  const metaObject = objectBase || (location ? { de: location.de, en: location.en, category: 'location' } : { de: '', en: '', category: 'context' });

  return {
    german: germanSentence,
    english: englishSentence,
    parts: germanParts,
    level,
    meta: {
      subject: {
        de: subject.de,
        en: subject.en,
        person: subject.person || 3,
        number: (subject.number as 'singular' | 'plural') || 'singular'
      },
      verbBase: {
        de: verbBase.de,
        en: verbBase.en,
        infinitive: verbBase.infinitive || '',
        objectCategories: verbBase.objectCategories
      },
      object: {
        de: metaObject.de,
        en: metaObject.en,
        category: metaObject.category
      },
      adjective,
      adverb,
      location
    }
  };
};

export function generateSimpleSentence(level: Level = 'A1'): GeneratedSentence {
  return buildTemplateSentence(level);
}

const buildEnglishVerb = (subject: { en: string; person?: number; number?: string }, verbBase: { en: string; infinitive?: string }) => {
  let englishVerb = verbBase.en;
  if (subject.person === 3 && subject.number === 'singular') {
    if (englishVerb.endsWith('ch') || englishVerb.endsWith('s') || englishVerb.endsWith('sh') || englishVerb.endsWith('x') || englishVerb.endsWith('z')) {
      englishVerb += 'es';
    } else {
      englishVerb += 's';
    }
  }
  if (verbBase.infinitive === 'sein') {
    if (subject.en === 'I') englishVerb = 'am';
    else if (subject.number === 'singular') englishVerb = 'is';
    else englishVerb = 'are';
  }
  return englishVerb;
};

const buildContextSentence = (level: Level, topic?: Topic, contextVocab?: VocabularyEntry[]): GeneratedSentence =>
  buildTemplateSentence(level, topic, contextVocab);

const remoteVocabCache = new Map<string, VocabularyEntry[]>();
const remoteExampleCache = new Map<string, string>();

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const extractGermanSentence = (extract: string, word: string) => {
  const sentences = (extract.match(/[^.!?]+[.!?]+/g) || [extract])
    .map(sentence => sentence.trim())
    .filter(Boolean);
  const matcher = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i');
  return sentences.find(sentence => matcher.test(sentence) && isGermanSentenceClean(sentence)) || null;
};

const fetchSupabaseExampleSentence = async (word: string) => {
  try {
    const { data, error } = await supabase
      .from('opendeutsch_vocab_database')
      .select('details')
      .eq('root', word)
      .limit(1);
    if (error || !data || data.length === 0) return null;
    const details = typeof data[0].details === 'string'
      ? JSON.parse(data[0].details)
      : data[0].details;
    const example = details?.example_de || details?.example;
    if (example && isGermanSentenceClean(example)) return example;
  } catch (err) {
    console.warn('Supabase example fetch failed', err);
  }
  return null;
};

const fetchRemoteExampleSentence = async (word: string) => {
  const cached = remoteExampleCache.get(word);
  if (cached) return cached;
  const supabaseExample = await fetchSupabaseExampleSentence(word);
  if (supabaseExample) {
    remoteExampleCache.set(word, supabaseExample);
    return supabaseExample;
  }
  const extracts = await fetchWikiExtracts(word, 4, 1);
  for (const extract of extracts) {
    const sentence = extractGermanSentence(extract, word);
    if (sentence) {
      remoteExampleCache.set(word, sentence);
      return sentence;
    }
  }
  return null;
};

const parseJsonFromResponse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    const text = await response.text();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
};

const fetchJsonWithFallback = async (urls: string[]) => {
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await parseJsonFromResponse(response);
      if (data) return data;
    } catch {
      continue;
    }
  }
  return null;
};

const buildProxyUrl = (url: string) => `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`;

const fetchWikiExtracts = async (query: string, sentenceCount = 5, limit = 2) => {
  const searchUrl = `https://de.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${limit}&format=json&origin=*`;
  const searchData = await fetchJsonWithFallback([
    searchUrl,
    buildProxyUrl(searchUrl),
    buildProxyUrl(searchUrl.replace('de.wikipedia.org', 'de.m.wikipedia.org'))
  ]);
  if (!searchData) {
    console.warn('Wikipedia unreachable; VPN required to access Wikipedia sources.');
    return [];
  }
  const titles = searchData?.query?.search?.map((item: { title: string }) => item.title) ?? [];
  if (titles.length === 0) return [];
  const titlesParam = titles.map((title: string) => encodeURIComponent(title)).join('|');
  const extractUrl = `https://de.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exsentences=${sentenceCount}&titles=${titlesParam}&format=json&origin=*`;
  const extractData = await fetchJsonWithFallback([
    extractUrl,
    buildProxyUrl(extractUrl),
    buildProxyUrl(extractUrl.replace('de.wikipedia.org', 'de.m.wikipedia.org'))
  ]);
  if (!extractData) {
    console.warn('Wikipedia unreachable; VPN required to access Wikipedia sources.');
    return [];
  }
  const pages = extractData?.query?.pages ?? {};
  return Object.values(pages)
    .map((page: { extract?: string }) => page.extract || '')
    .filter(Boolean);
};

const isEnglishOptionClean = (value: string) => {
  const text = value.trim();
  if (text.length < 6) return false;
  if (/[äöüß]/i.test(text)) return false;
  const germanWords = /\b(der|die|das|und|nicht|weil|aber|deshalb|heute|jetzt|ein|eine|einen|dem|den|des|im|am|auf|mit|für|ist|sind|war|waren|hat|haben|wird|werden)\b/i;
  if (germanWords.test(text)) return false;
  const letters = text.replace(/[^a-zA-Z\s']/g, '').trim();
  if (letters.length < text.length * 0.6) return false;
  const wordCount = letters.split(/\s+/).filter(Boolean).length;
  return wordCount >= 3;
};

const isGermanSentenceClean = (value: string) => {
  const text = value.trim();
  if (text.length < 6) return false;
  const englishWords = /\b(the|and|but|because|therefore|a|an|is|are|was|were|have|has|had|will|would|should|could)\b/i;
  if (englishWords.test(text)) return false;
  const letters = text.replace(/[^a-zA-ZÄÖÜäöüß\s']/g, '').trim();
  if (letters.length < text.length * 0.6) return false;
  const wordCount = letters.split(/\s+/).filter(Boolean).length;
  return wordCount >= 3;
};

const isSentencePairClean = (sentence: GeneratedSentence) =>
  isGermanSentenceClean(sentence.german) && isEnglishOptionClean(sentence.english);

const fetchRemoteVocabulary = async (query: string, count: number) => {
  const cached = remoteVocabCache.get(query);
  if (cached && cached.length >= count) return cached.slice(0, count);
  const extracts = await fetchWikiExtracts(query, 4, 2);
  if (extracts.length === 0) return [];
  const nouns = extractNouns(extracts.join(' '));
  const matches = nouns
    .map(noun => LOCAL_VOCAB_INDEX.get(normalizeWord(noun)))
    .filter(Boolean) as VocabularyEntry[];
  const unique = Array.from(new Map(matches.map(item => [item.de, item])).values());
  const result = unique.slice(0, count);
  remoteVocabCache.set(query, result);
  return result;
};

const getTopicVocabulary = (topic?: Topic, count = 8, level: Level = 'A1') => {
  const levelPool = getLocalVocabularyForLevel(level);
  if (!topic) return pickRandomItems(levelPool, count);
  const keywordsByTopic: Record<string, string[]> = {
    history: ['history', 'war', 'empire', 'king', 'city', 'culture'],
    aviation: ['air', 'flight', 'plane', 'pilot', 'engine', 'airport'],
    f1: ['race', 'car', 'track', 'driver', 'team', 'engine'],
    news: ['government', 'market', 'economy', 'company', 'city', 'people']
  };
  const keywords = keywordsByTopic[topic] || [];
  const matches = keywords
    .flatMap(keyword => LOCAL_VOCAB_EN_INDEX.get(keyword) || [])
    .filter(item => levelPool.some(levelItem => levelItem.de === item.de));
  const unique = Array.from(new Map(matches.map(item => [item.de, item])).values());
  if (unique.length >= count) return pickRandomItems(unique, count);
  return [...unique, ...pickRandomItems(levelPool, count - unique.length)];
};

const getSentenceSignature = (sentence: GeneratedSentence) => {
  const subject = sentence.meta.subject.de.toLowerCase();
  const verb = sentence.meta.verbBase.infinitive.toLowerCase();
  const object = sentence.meta.object.de.toLowerCase();
  const location = sentence.meta.location?.de?.toLowerCase() || '';
  return [subject, verb, object, location].join('|');
};

const buildUniqueSentences = (count: number, level: Level, topic?: Topic, vocab?: VocabularyEntry[]) => {
  const target = Math.max(count * 4, count + 6);
  const candidates = buildContextSentences(target, level, topic, vocab);
  const seen = new Set<string>();
  const unique: GeneratedSentence[] = [];
  for (const sentence of candidates) {
    const signature = getSentenceSignature(sentence);
    if (seen.has(signature)) continue;
    seen.add(signature);
    unique.push(sentence);
    if (unique.length >= count) break;
  }
  return unique.length >= count ? unique : candidates.slice(0, count);
};

const buildContextSentences = (count: number, level: Level, topic?: Topic, vocab?: VocabularyEntry[]) => {
  const contextVocab = vocab ?? getTopicVocabulary(topic, Math.max(6, Math.ceil(count / 2)), level);
  const sentences: GeneratedSentence[] = [];
  for (let i = 0; i < count; i += 1) {
    sentences.push(buildContextSentence(level, topic, contextVocab));
  }
  return sentences;
};

const getSentencePool = async (count: number, level: Level, topic?: Topic, contextVocab?: VocabularyEntry[]) => {
  let sentences: GeneratedSentence[] = [];
  
  try {
    // Try to fetch sentences from DB first to leverage LLM-generated content
    const vocabFilter = contextVocab?.map(v => v.de);
    const dbSentences = await getSentencesFromDB(level, 'present', count, topic, vocabFilter);
    if (dbSentences.length > 0) {
      sentences = dbSentences;
    }
  } catch (err) {
    console.warn('DB Fetch failed, falling back to local generator', err);
  }

  if (sentences.length < count) {
    const needed = count - sentences.length;
    // Generate extra to ensure we have enough clean ones
    const generated = buildUniqueSentences(needed + Math.max(5, needed), level, topic, contextVocab).filter(isSentencePairClean);
    sentences = [...sentences, ...generated];
  }

  return sentences.slice(0, count);
};

const getVocabularyPool = async (count: number, topic: Topic | undefined, level: Level) => {
  try {
    const supabaseVocab = await getVocabForLevel(level, Math.max(20, count * 2));
    if (supabaseVocab && supabaseVocab.length > 0) {
      const mapped: VocabularyEntry[] = supabaseVocab.map((row: any) => ({
        de: row.root,
        en: row.meaning,
        pos: row.type,
        gender: row.details?.gender,
        plural: row.details?.plural,
        genitive: row.details?.genitive,
        ipa: row.details?.ipa,
        en_variants: row.details?.en_variants,
        zh: row.details?.zh
      }));
      
      if (mapped.length >= count) {
        return pickRandomItems(mapped, count);
      }
      
      // If not enough, return what we have plus fallback from local
      const remaining = count - mapped.length;
      const local = getTopicVocabulary(topic, remaining, level);
      return shuffleArray([...mapped, ...local]).slice(0, count);
    }
  } catch (err) {
    console.warn('Supabase vocab fetch failed', err);
  }

  const query = topic || 'Deutschland';
  const levelPool = getLocalVocabularyForLevel(level);
  if (level === 'A0') return pickRandomItems(levelPool, count);
  const remote = await fetchRemoteVocabulary(query, Math.max(4, Math.floor(count / 2)));
  const remoteFiltered = remote.filter(item => levelPool.some(levelItem => levelItem.de === item.de));
  if (remoteFiltered.length >= count) return remoteFiltered.slice(0, count);
  const local = getTopicVocabulary(topic, count - remoteFiltered.length, level);
  return shuffleArray([...remoteFiltered, ...local]).slice(0, count);
};

const buildFallbackExample = (entry: VocabularyEntry) => ({
  de: `Ich lerne das Wort "${entry.de}".`,
  en: `I am learning the word "${entry.en}".`
});

export const generateVocabularyCards = async (
  level: Level,
  topic?: Topic,
  count = 12
): Promise<VocabularyCard[]> => {
  const pool = await getVocabularyPool(Math.max(count, 8), topic, level);
  const filtered = pool.filter(item => isAllowedVocabularyWord(item.de));
  const unique = Array.from(new Map(filtered.map(item => [item.de, item])).values());
  const fallback = getTopicVocabulary(topic, count - unique.length, level).filter(item => isAllowedVocabularyWord(item.de));
  const selected = [...unique, ...fallback].slice(0, count);
  const cards = await Promise.all(selected.map(async (entry) => {
    const remoteExample = await fetchRemoteExampleSentence(entry.de);
    return {
      id: `${normalizeWord(entry.de)}-${Math.random().toString(36).slice(2)}`,
      word: entry,
      example: remoteExample
        ? { de: remoteExample, en: buildFallbackExample(entry).en }
        : buildFallbackExample(entry),
      level,
      topic,
      source: remoteExample ? 'remote' as const : 'local' as const
    };
  }));
  return cards;
};

export const getReadingFallback = (topic: Topic): GeneratedText | null => {
  // This is a synchronous wrapper around the async fetch.
  // Ideally, components should use fetchReadingsFromSupabase directly.
  // But for legacy compatibility, we might return null here or a default.
  // Given we removed the local JSON, we can only return null here.
  return null;
};

export const fetchReadingsFromSupabase = async (topic: string | null, limit: number = 5, searchTerm?: string, level?: string): Promise<GeneratedText[]> => {
  try {
    let query = supabase
              .from('opendeutsch_readings')
              .select(`
                id,
                title,
                content,
                topic,
                level,
                complexity_score,
                source_name,
                source_url,
                published_at,
                opendeutsch_reading_vocabulary (
                  word,
                  translation,
                  pos,
                  definition
                ),
                opendeutsch_reading_questions (
                  question,
                  options,
                  correct_index
                )
              `);

    if (topic) {
      query = query.eq('topic', topic);
    }

    if (level) {
      query = query.eq('level', level);
    }

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
    }

    const { data: readings, error } = await query
              .order('published_at', { ascending: false })
              .limit(limit);

    if (error) {
      console.error('Error fetching readings:', error);
      return [];
    }

    if (!readings) return [];

    return readings.map((r: any) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      topic: r.topic as Topic,
      level: (r.level as Level) || 'B1',
      complexity_score: r.complexity_score,
      source: {
        name: r.source_name || 'Unknown',
        url: r.source_url || '#'
      },
      published_at: r.published_at,
      vocabulary: r.opendeutsch_reading_vocabulary,
      questions: r.opendeutsch_reading_questions.map((q: any) => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correct_index
      }))
    }));
  } catch (err) {
    console.error('Exception fetching readings:', err);
    return [];
  }
};

export const generateContextReadingText = (topic: Topic): GeneratedText => {
  const sentences = buildContextSentences(4, 'A1', topic);
  const content = sentences.map(item => item.german).join(' ');
  const title = `Ein Text über ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;
  const questionSentence = sentences[1] || sentences[0];
  const questionText = `Was passiert im Text?`;
  const options = shuffleArray([
    questionSentence?.german || content.split(' ')[0],
    sentences[2]?.german || content.split(' ').slice(0, 5).join(' ') + '.',
    'Nichts Besonderes.',
    'Es ist unklar.'
  ]).slice(0, 4);
  const correctIndex = options.indexOf(questionSentence?.german || options[0]);
  return {
    id: Math.random().toString(36).slice(2),
    title,
    content,
    topic,
    questions: [
      {
        question: questionText,
        options,
        correctIndex: correctIndex >= 0 ? correctIndex : 0
      }
    ]
  };
};

function buildEnglishOptions(correct: string, pool: string[]) {
  const unique = Array.from(new Set(pool.filter(item => item !== correct)));
  const options = shuffleArray([correct, ...unique]).slice(0, 4);
  if (!options.includes(correct)) {
    options[Math.floor(Math.random() * options.length)] = correct;
  }
  return shuffleArray(options);
}

const buildEnglishSentenceVariant = (
  sentence: GeneratedSentence,
  objectEn: string,
  locationEn?: string
) => {
  const subject = sentence.meta.subject;
  const verbBase = sentence.meta.verbBase;
  const englishVerb = buildEnglishVerb(subject, verbBase);
  const parts = [
    subject.en,
    englishVerb,
    sentence.meta.adverb?.en,
    objectEn,
    locationEn
  ].filter(Boolean) as string[];
  return `${parts.join(' ')}.`;
};

function buildSimilarEnglishOptions(sentence: GeneratedSentence, sentences: GeneratedSentence[]) {
  const correct = sentence.english;
  const category = sentence.meta.object.category;
  const objectEn = sentence.meta.object.en;
  const locationEn = sentence.meta.location?.en;
  const categoryPool = category === 'location'
    ? wordPools.locations.map(item => item.en)
    : category && category !== 'context'
      ? wordPools.objects.filter(item => item.category === category).map(item => item.en)
      : [];
  const fallbackPool = sentences.map(item => item.english);
  const basePool = categoryPool.length > 0 ? categoryPool : fallbackPool;
  const distractors = pickClosestWords(objectEn, basePool.filter(Boolean), 3, 0.2);
  const variants = distractors.map(option => buildEnglishSentenceVariant(sentence, option, category === 'location' ? option : locationEn));
  const pool = Array.from(new Set([correct, ...variants, ...fallbackPool])).filter(isEnglishOptionClean);
  return buildEnglishOptions(correct, pool);
}

function buildVerbOptions(sentence: GeneratedSentence) {
  const personKey = `${sentence.meta.subject.person}${sentence.meta.subject.number === 'singular' ? 's' : 'p'}`;
  const targetCategories = sentence.meta.verbBase.objectCategories || [];
  const filteredVerbs = targetCategories.length > 0
    ? wordPools.verbs.filter(verb => (verb.objectCategories || []).some(category => targetCategories.includes(category)))
    : wordPools.verbs;
  const verbs = filteredVerbs.map(verb => conjugations[verb.infinitive || '']?.[personKey] || verb.de);
  const unique = Array.from(new Set(verbs));
  const correct = conjugations[sentence.meta.verbBase.infinitive]?.[personKey] || sentence.meta.verbBase.de;
  const options = shuffleArray([correct, ...unique.filter(item => item !== correct)]).slice(0, 4);
  if (!options.includes(correct)) {
    options[Math.floor(Math.random() * options.length)] = correct;
  }
  return shuffleArray(options);
}

function buildObjectOptions(sentence: GeneratedSentence) {
  const adjective = sentence.meta.adjective;
  const verbBase = sentence.meta.verbBase;
  const isLocation = sentence.meta.object.category === 'location';
  if (isLocation) {
    const options = wordPools.locations.map(item => item.de);
    const correct = sentence.meta.object.de;
    const unique = Array.from(new Set(options));
    const distractors = pickClosestWords(correct, unique, 3, 0.2);
    const trimmed = shuffleArray([correct, ...distractors]).slice(0, 4);
    if (!trimmed.includes(correct)) {
      trimmed[Math.floor(Math.random() * trimmed.length)] = correct;
    }
    return shuffleArray(trimmed);
  }
  const filteredObjects = verbBase.objectCategories
    ? wordPools.objects.filter(objectItem => verbBase.objectCategories?.includes(objectItem.category || ''))
    : wordPools.objects;
  const basePool = filteredObjects.length > 0 ? filteredObjects : wordPools.objects;
  const categoryPool = sentence.meta.object.category
    ? basePool.filter(item => item.category === sentence.meta.object.category)
    : [];
  const objectPool = categoryPool.length >= 4 ? categoryPool : basePool;
  const objectOptions = objectPool.map(item => adjective ? `${adjective.de} ${item.de}` : item.de);
  const correct = adjective ? `${adjective.de} ${sentence.meta.object.de}` : sentence.meta.object.de;
  const unique = Array.from(new Set(objectOptions));
  const distractors = pickClosestWords(correct, unique, 3, 0.2);
  const options = shuffleArray([correct, ...distractors]).slice(0, 4);
  if (!options.includes(correct)) {
    options[Math.floor(Math.random() * options.length)] = correct;
  }
  return shuffleArray(options);
}

function buildVocabularyOptions(sentence: GeneratedSentence, vocabPool: VocabularyEntry[], level: Level) {
  const correct = sentence.meta.object.en;
  const category = sentence.meta.object.category;
  const categoryPool = category === 'location'
    ? wordPools.locations.map(item => item.en)
    : category && category !== 'context'
      ? wordPools.objects.filter(item => item.category === category).map(item => item.en)
      : [];
  const contextPool = vocabPool.map(item => item.en).filter(Boolean);
  const levelPool = getLocalVocabularyForLevel(level).map(item => item.en).filter(Boolean);
  const basePool = categoryPool.length > 0 ? categoryPool : contextPool;
  const mergedPool = Array.from(new Set([...basePool, ...levelPool].filter(item => item !== correct)));
  const distractors = pickSimilarWords(correct, mergedPool, 3);
  const options = shuffleArray([correct, ...distractors]).slice(0, 4);
  if (!options.includes(correct)) {
    options[Math.floor(Math.random() * options.length)] = correct;
  }
  return shuffleArray(options);
}

function buildTenseOptions(sentence: GeneratedSentence) {
  const personKey = `${sentence.meta.subject.person}${sentence.meta.subject.number === 'singular' ? 's' : 'p'}`;
  const present = conjugations[sentence.meta.verbBase.infinitive]?.[personKey] || sentence.meta.verbBase.de;
  const past = pastConjugations[sentence.meta.verbBase.infinitive]?.[personKey] || sentence.meta.verbBase.de;
  const options = shuffleArray([present, past]);
  return { present, past, options };
}

export async function generateExercises({
  count = 5,
  level = 'A1',
  type = 'sentence_reconstruction'
}: {
  count?: number;
  level?: Level;
  type?: ExerciseType;
}): Promise<ExerciseItem[]> {
  const contextVocab = await getVocabularyPool(Math.max(8, count + 6), undefined, level);
  const sentences = await getSentencePool(count + 10, level, undefined, contextVocab);

  return Array.from({ length: count }, (_, index) => {
    const sentence = sentences[index];
    const id = `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`;

    if (type === 'multiple_choice') {
      return {
        id,
        type,
        level,
        prompt: sentence.german,
        options: buildSimilarEnglishOptions(sentence, sentences),
        answer: sentence.english,
        sentence
      };
    }

    if (type === 'vocabulary') {
      return {
        id,
        type,
        level,
        prompt: sentence.meta.object.de,
        options: buildVocabularyOptions(sentence, contextVocab, level),
        answer: sentence.meta.object.en,
        sentence
      };
    }

    if (type === 'tense') {
      const { present, past, options } = buildTenseOptions(sentence);
      const targetTense: 'present' | 'past' = (level === 'A0' || level === 'A1')
        ? 'present'
        : Math.random() > 0.5
          ? 'past'
          : 'present';
      const correct = targetTense === 'past' ? past : present;
      const prompt = sentence.german.replace(present, '____').replace(past, '____');
      return {
        id,
        type,
        level,
        prompt,
        options,
        answer: correct,
        sentence,
        targetTense
      };
    }

    if (type === 'fill_blank' || type === 'grammar_cloze') {
      const useVerb = level === 'A2' || level === 'B1' ? Math.random() > 0.4 : Math.random() > 0.7;
      if (useVerb) {
        const options = buildVerbOptions(sentence);
        const personKey = `${sentence.meta.subject.person}${sentence.meta.subject.number === 'singular' ? 's' : 'p'}`;
        const correct = conjugations[sentence.meta.verbBase.infinitive]?.[personKey] || sentence.meta.verbBase.de;
        const prompt = sentence.german.replace(correct, '____');
        return {
          id,
          type: 'fill_blank', // standardizing type
          level,
          prompt,
          options,
          answer: correct,
          sentence
        };
      }

      const options = buildObjectOptions(sentence);
      const objectDe = sentence.meta.adjective ? `${sentence.meta.adjective.de} ${sentence.meta.object.de}` : sentence.meta.object.de;
      const prompt = sentence.german.replace(objectDe, '____');
      return {
        id,
        type: 'fill_blank',
        level,
        prompt,
        options,
        answer: objectDe,
        sentence
      };
    }

    if (type === 'sentence_writing') {
      return {
        id,
        type,
        level,
        prompt: sentence.english,
        answer: sentence.german,
        sentence
      };
    }
    
    if (type === 'word_order' || type === 'sentence_reconstruction') {
      return {
        id,
        type: 'sentence_reconstruction',
        level,
        prompt: sentence.english,
        answer: sentence.german,
        sentence
      };
    }

    if (type === 'vocabulary_matching') {
      const pairs = sentences.slice(index, index + 4).map(s => ({
         left: s.meta.object.de,
         right: s.meta.object.en
      }));
      return {
        id,
        type,
        level,
        prompt: "Match the German words to English",
        answer: JSON.stringify(pairs),
        pairs
      };
    }

    return {
      id,
      type: 'sentence_reconstruction',
      level,
      prompt: sentence.english,
      answer: sentence.german,
      sentence
    };
  });
}

export async function generateBlock(concept: string, level: Level, explicitType?: ExerciseType): Promise<ExerciseItem[]> {
    let type: ExerciseType = 'sentence_reconstruction';
    
    if (explicitType) {
        type = explicitType;
    } else {
        // Fallback inference
        if (concept.includes('vocabulary') || concept.includes('words')) type = 'vocabulary';
        else if (concept.includes('grammar') || concept.includes('cloze')) type = 'fill_blank';
        else if (concept.includes('tense')) type = 'tense';
        else if (concept.includes('matching')) type = 'vocabulary_matching';
        else if (concept.includes('choice')) type = 'multiple_choice';
        else if (concept.includes('writing')) type = 'sentence_writing';
        else if (concept.includes('reading')) type = 'multiple_choice'; // Fallback for reading to MCQ for now
    }

    return generateExercises({ count: 5, level, type });
}

export function generateReadingText(topic: Topic, level: Level = 'A1'): GeneratedText {
  const pool = topicPools[topic];
  // If no specific pool for topic, we can still generate generic content or return a simple default



  const targetWordCount = {
    'A0': 40,
    'A1': 90, // Target ~90 (60-120)
    'A2': 170, // Target ~170 (120-220)
    'B1': 300 // Target ~300 (250-400)
  }[level] || 90;

  const sentences: GeneratedSentence[] = [];
  let currentWordCount = 0;
  
  // Use the topic pool if available, otherwise mix general vocabulary
  // We can use buildTemplateSentence with the topic context
  
  while (currentWordCount < targetWordCount) {
    const sentence = buildTemplateSentence(level, topic);
    sentences.push(sentence);
    currentWordCount += sentence.german.split(' ').length;
  }

  const content = sentences.map(s => s.german).join(' ');
  const title = `Lesetext: ${topic.charAt(0).toUpperCase() + topic.slice(1)} (${level})`;

  // Generate Questions
  // We will generate 3 questions for A1/A2 and 5 for B1
  const questionCount = level === 'B1' ? 5 : 3;
  const questions = [];

  // Strategy: Pick random sentences from the text and ask about the subject/object/verb
  // We need to pick unique sentences for questions
  const questionSentences = shuffleArray(sentences).slice(0, questionCount);

  for (const s of questionSentences) {
      // 50% chance to ask about subject, 50% about object
      const askSubject = Math.random() > 0.5;
      
      if (askSubject) {
          // Question: Wer [verb] [object]? -> Answer: [Subject]
          const q = `Wer oder was ${s.meta.verbBase.de} ${s.meta.object.de}?`;
          const correct = s.meta.subject.de;
          
          // Distractors: other subjects from the text or pool
          const otherSubjects = sentences
            .filter(sent => sent.meta.subject.de !== correct)
            .map(sent => sent.meta.subject.de);
            
          const poolSubjects = pool ? pool.subjects.map(sub => sub.de) : [];
          
          const allDistractors = Array.from(new Set([...otherSubjects, ...poolSubjects]))
            .filter(d => d !== correct);
            
          const distractors = shuffleArray(allDistractors).slice(0, 3);
          const options = shuffleArray([correct, ...distractors]);
          
          questions.push({
              question: q,
              options,
              correctIndex: options.indexOf(correct)
          });
      } else {
          // Question: Was [verb] [subject]? -> Answer: [Object]
          const q = `Was ${s.meta.verbBase.de} ${s.meta.subject.de}?`;
          const correct = s.meta.object.de;
          
           // Distractors: other objects from the text or pool
          const otherObjects = sentences
            .filter(sent => sent.meta.object.de !== correct)
            .map(sent => sent.meta.object.de);
            
          const poolObjects = pool ? pool.objects.map(obj => obj.de) : [];
          
          const allDistractors = Array.from(new Set([...otherObjects, ...poolObjects]))
            .filter(d => d !== correct);
            
          const distractors = shuffleArray(allDistractors).slice(0, 3);
          const options = shuffleArray([correct, ...distractors]);
          
          questions.push({
              question: q,
              options,
              correctIndex: options.indexOf(correct)
          });
      }
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    title,
    content,
    topic,
    questions
  };
}
