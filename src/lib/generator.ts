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
import sentences0000 from '../data/generated/sentences-0000.json';
import sentences0001 from '../data/generated/sentences-0001.json';
import sentences0002 from '../data/generated/sentences-0002.json';
import sentences0003 from '../data/generated/sentences-0003.json';
import sentences0004 from '../data/generated/sentences-0004.json';
import sentences0005 from '../data/generated/sentences-0005.json';
import sentences0006 from '../data/generated/sentences-0006.json';
import sentences0007 from '../data/generated/sentences-0007.json';
import readingsData from '../data/generated/readings.json';

export type Level = 'A0' | 'A1' | 'A2' | 'B1';
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

export interface GeneratedSentence {
  german: string;
  english: string;
  parts: string[];
  level: Level;
  meta: {
    subject: {
      de: string;
      en: string;
      person: number;
      number: 'singular' | 'plural';
    };
    verbBase: {
      de: string;
      en: string;
      infinitive: string;
      objectCategories?: string[];
    };
    object: {
      de: string;
      en: string;
      category?: string;
    };
    adjective?: {
      de: string;
      en: string;
    } | null;
    adverb?: {
      de: string;
      en: string;
    } | null;
    location?: {
      de: string;
      en: string;
    } | null;
  };
}

export interface GeneratedText {
  id: string;
  title: string;
  content: string;
  topic: Topic;
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

type VocabularyEntry = {
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
const LOCAL_SENTENCE_LIMIT = 500;

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

const LOCAL_SENTENCES: GeneratedSentence[] = [
  ...(sentences0000 as GeneratedSentence[]),
  ...(sentences0001 as GeneratedSentence[]),
  ...(sentences0002 as GeneratedSentence[]),
  ...(sentences0003 as GeneratedSentence[]),
  ...(sentences0004 as GeneratedSentence[]),
  ...(sentences0005 as GeneratedSentence[]),
  ...(sentences0006 as GeneratedSentence[]),
  ...(sentences0007 as GeneratedSentence[])
];

const LOCAL_READINGS = readingsData as LocalReading[];

const isSimpleWord = (value: string) => {
  if (!value) return false;
  if (value.includes(' ') || value.includes('-') || value.includes('.') || value.includes(',')) return false;
  if (/\d/.test(value)) return false;
  return /^[A-Za-zÄÖÜäöüß]+$/.test(value);
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

const LOCAL_VOCAB_POOL = LOCAL_VOCAB.filter(item => isSimpleWord(item.de)).slice(0, LOCAL_VOCAB_LIMIT);
const LOCAL_SENTENCE_POOL = LOCAL_SENTENCES.slice(0, LOCAL_SENTENCE_LIMIT);
const LOCAL_VOCAB_INDEX = buildVocabIndex(LOCAL_VOCAB_POOL);
const LOCAL_VOCAB_EN_INDEX = buildVocabEnIndex(LOCAL_VOCAB_POOL);

const pickRandomItems = <T,>(items: T[], count: number) => {
  if (items.length <= count) return [...items];
  const shuffled = shuffleArray(items);
  return shuffled.slice(0, count);
};

const splitSentences = (content: string) =>
  content
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 20 && sentence.length < 140);

const extractNouns = (content: string) => {
  const matches = content.match(/\b[A-ZÄÖÜ][a-zäöüß]{2,}\b/g) ?? [];
  return Array.from(new Set(matches)).filter(isSimpleWord);
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

export function generateSimpleSentence(level: Level = 'A1'): GeneratedSentence {
  const subject = getRandomItem(wordPools.subjects);
  const verbBase = getRandomItem(wordPools.verbs);
  const personKey = `${subject.person || 3}${subject.number === 'singular' ? 's' : 'p'}`;
  
  // Handle case where conjugations might be missing for some verbs or person keys
  const verbConjugations = conjugations[verbBase.infinitive || ''];
  const conjugatedVerb = verbConjugations?.[personKey] || verbBase.de;

  const filteredObjects = verbBase.objectCategories
    ? wordPools.objects.filter(objectItem => verbBase.objectCategories?.includes(objectItem.category || ''))
    : wordPools.objects;
  const objectPool = filteredObjects.length > 0 ? filteredObjects : wordPools.objects;
  const nounSubjects = wordPools.subjects.filter(item => item.type === 'noun');
  const predicate = verbBase.infinitive === 'sein' && nounSubjects.length > 0
    ? getRandomItem(nounSubjects)
    : null;
  const object = predicate ? { ...predicate, category: 'person' } : getRandomItem(objectPool);

  const { includeLocation, includeAdjective, includeAdverb } = getLevelConfig(level);
  const adjective = includeAdjective ? getRandomItem(wordPools.adjectives) : null;
  const adverb = includeAdverb ? getRandomItem(wordPools.adverbs) : null;
  const location = includeLocation ? getRandomItem(wordPools.locations) : null;

  // Case handling
  const targetCase = verbBase.case || 'accusative';
  let objectDe = object.de;

  // Only apply declension if we have gender info and it's a standard case
  if (object.gender && (targetCase === 'accusative' || targetCase === 'dative' || targetCase === 'nominative')) {
    const parts = object.de.split(' ');
    // Assume format "Article Noun" or just "Noun"
    // If it starts with an article we recognize, replace it
    const firstWord = parts[0].toLowerCase();
    const isIndefinite = ['ein', 'eine', 'einen'].includes(firstWord);
    
    if (isIndefinite || parts.length === 2) {
      const noun = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];
      const newArticle = getIndefiniteArticle(object.gender, targetCase);
      
      if (adjective) {
        const ending = getAdjectiveEnding(object.gender, targetCase);
        objectDe = `${newArticle} ${adjective.de}${ending} ${noun}`;
      } else {
        objectDe = `${newArticle} ${noun}`;
      }
    }
  } else if (adjective) {
    // Fallback for objects without clear article structure or non-standard cases
    objectDe = `${adjective.de} ${object.de}`;
  }

  const objectEn = adjective ? `${adjective.en} ${object.en}` : object.en;

  const germanParts = [
    subject.de,
    conjugatedVerb,
    adverb?.de,
    objectDe,
    location?.de
  ].filter(Boolean) as string[];

  const germanSentence = `${germanParts.join(' ')}.`;

  let englishVerb = verbBase.en;
  if (subject.person === 3 && subject.number === 'singular') {
    if (englishVerb.endsWith('ch') || englishVerb.endsWith('s') || englishVerb.endsWith('sh') || englishVerb.endsWith('x') || englishVerb.endsWith('z')) {
      englishVerb += 'es';
    } else {
      englishVerb += 's';
    }
  }
  // Simple check for "be" -> "is"/"am"/"are" could be added here for better English, but keeping it simple for now.
  if (verbBase.infinitive === 'sein') {
     if (subject.en === 'I') englishVerb = 'am';
     else if (subject.number === 'singular') englishVerb = 'is';
     else englishVerb = 'are';
  }

  const englishParts = [
    subject.en,
    englishVerb,
    adverb?.en,
    objectEn,
    location?.en
  ].filter(Boolean) as string[];

  const englishSentence = `${englishParts.join(' ')}.`;

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
        de: object.de,
        en: object.en,
        category: object.category
      },
      adjective,
      adverb,
      location
    }
  };
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

const buildContextSentence = (
  level: Level,
  contextNouns: VocabularyEntry[],
  topic?: Topic
): GeneratedSentence => {
  const pool = topic ? topicPools[topic] : null;
  const subject = pool?.subjects ? getRandomItem(pool.subjects) : getRandomItem(wordPools.subjects);
  const verbBase = pool?.verbs ? getRandomItem(pool.verbs) : getRandomItem(wordPools.verbs);
  const personKey = `${subject.person || 3}${subject.number === 'singular' ? 's' : 'p'}`;
  const verbConjugations = conjugations[verbBase.infinitive || ''];
  const conjugatedVerb = verbConjugations?.[personKey] || verbBase.de;
  const candidateObject = contextNouns.length > 0 ? getRandomItem(contextNouns) : null;
  const fallbackObjects = pool?.objects ?? wordPools.objects;
  const objectBase = candidateObject
    ? {
        de: candidateObject.de,
        en: candidateObject.en,
        gender: candidateObject.gender as 'm' | 'f' | 'n' | undefined,
        category: 'context'
      }
    : getRandomItem(fallbackObjects);
  const { includeLocation, includeAdjective, includeAdverb } = getLevelConfig(level);
  const adjective = includeAdjective ? getRandomItem(wordPools.adjectives) : null;
  const adverb = includeAdverb ? getRandomItem(wordPools.adverbs) : null;
  const location = includeLocation ? getRandomItem(wordPools.locations) : null;
  const targetCase = verbBase.case || 'accusative';
  let objectDe = objectBase.de;
  if (objectBase.gender && (targetCase === 'accusative' || targetCase === 'dative' || targetCase === 'nominative')) {
    const noun = objectBase.de;
    const newArticle = getIndefiniteArticle(objectBase.gender, targetCase);
    if (adjective) {
      const ending = getAdjectiveEnding(objectBase.gender, targetCase);
      objectDe = `${newArticle} ${adjective.de}${ending} ${noun}`;
    } else {
      objectDe = `${newArticle} ${noun}`;
    }
  } else if (adjective) {
    objectDe = `${adjective.de} ${objectBase.de}`;
  }
  const objectEn = adjective ? `${adjective.en} ${objectBase.en}` : objectBase.en;
  const openers = ['Heute', 'Am Morgen', 'In der Stadt', 'Manchmal', 'Jetzt'];
  const connectors = ['weil', 'aber', 'und', 'deshalb'];
  const opener = Math.random() > 0.6 ? getRandomItem(openers) : null;
  const includeSecondClause = level !== 'A0' && Math.random() > 0.7;
  const germanParts = [
    opener,
    subject.de,
    conjugatedVerb,
    adverb?.de,
    objectDe,
    location?.de
  ].filter(Boolean) as string[];
  let germanSentence = `${germanParts.join(' ')}.`;
  if (includeSecondClause) {
    const secondVerb = getRandomItem(wordPools.verbs);
    const secondConjugation = conjugations[secondVerb.infinitive || '']?.[personKey] || secondVerb.de;
    const connector = getRandomItem(connectors);
    germanSentence = `${germanParts.join(' ')} ${connector} ${subject.de} ${secondConjugation}.`;
  }
  const englishVerb = buildEnglishVerb(subject, verbBase);
  const englishParts = [
    opener ? opener.toLowerCase() : null,
    subject.en,
    englishVerb,
    adverb?.en,
    objectEn,
    location?.en
  ].filter(Boolean) as string[];
  let englishSentence = `${englishParts.join(' ')}.`;
  if (includeSecondClause) {
    const connector = germanSentence.includes('weil') ? 'because' : germanSentence.includes('aber') ? 'but' : germanSentence.includes('deshalb') ? 'therefore' : 'and';
    const secondVerb = getRandomItem(wordPools.verbs);
    const secondEnglishVerb = buildEnglishVerb(subject, secondVerb);
    englishSentence = `${englishParts.join(' ')} ${connector} ${subject.en} ${secondEnglishVerb}.`;
  }
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
        de: objectBase.de,
        en: objectBase.en,
        category: objectBase.category
      },
      adjective,
      adverb,
      location
    }
  };
};

const remoteVocabCache = new Map<string, VocabularyEntry[]>();
const remoteSentenceCache = new Map<string, GeneratedSentence[]>();

const fetchWikiExtracts = async (query: string, sentenceCount = 5, limit = 2) => {
  const searchUrl = `https://de.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${limit}&format=json&origin=*`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) return [];
  const searchData = await searchRes.json();
  const titles = searchData?.query?.search?.map((item: { title: string }) => item.title) ?? [];
  if (titles.length === 0) return [];
  const titlesParam = titles.map((title: string) => encodeURIComponent(title)).join('|');
  const extractUrl = `https://de.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exsentences=${sentenceCount}&titles=${titlesParam}&format=json&origin=*`;
  const extractRes = await fetch(extractUrl);
  if (!extractRes.ok) return [];
  const extractData = await extractRes.json();
  const pages = extractData?.query?.pages ?? {};
  return Object.values(pages)
    .map((page: { extract?: string }) => page.extract || '')
    .filter(Boolean);
};

const buildSentenceParts = (sentence: string) => {
  const clean = sentence.replace(/[.!?]/g, '').trim();
  return clean.split(/\s+/).filter(Boolean);
};

const buildEnglishFromGerman = (parts: string[]) => {
  const translated = parts.map(word => {
    const normalized = normalizeWord(word);
    const entry = LOCAL_VOCAB_INDEX.get(normalized);
    return entry?.en || word.toLowerCase();
  });
  return translated.join(' ');
};

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

const fetchRemoteSentences = async (query: string, level: Level, count: number) => {
  const cached = remoteSentenceCache.get(query);
  if (cached && cached.length >= count) return cached.slice(0, count);
  const extracts = await fetchWikiExtracts(query, 6, 2);
  const sentences = extracts.flatMap(content => splitSentences(content));
  const result: GeneratedSentence[] = [];
  for (const sentence of sentences) {
    if (result.length >= count) break;
    if (!/[A-ZÄÖÜ]/.test(sentence[0] || '')) continue;
    const parts = buildSentenceParts(sentence);
    if (parts.length < 4 || parts.length > 14) continue;
    const english = buildEnglishFromGerman(parts);
    const translatedRatio = parts.filter(word => LOCAL_VOCAB_INDEX.has(normalizeWord(word))).length / parts.length;
    if (translatedRatio < 0.5) continue;
    result.push({
      german: sentence.endsWith('.') || sentence.endsWith('!') || sentence.endsWith('?') ? sentence : `${sentence}.`,
      english: `${english}.`,
      parts,
      level,
      meta: {
        subject: { de: parts[0], en: english.split(' ')[0] || parts[0], person: 3, number: 'singular' },
        verbBase: { de: parts[1] || '', en: english.split(' ')[1] || '', infinitive: parts[1] || '' },
        object: { de: parts[2] || '', en: english.split(' ')[2] || '', category: 'context' },
        adjective: null,
        adverb: null,
        location: null
      }
    });
  }
  remoteSentenceCache.set(query, result);
  return result;
};

const getLocalVocabulary = (count: number) => pickRandomItems(LOCAL_VOCAB_POOL, count);

const getLocalSentences = (count: number) => pickRandomItems(LOCAL_SENTENCE_POOL, count);

const getTopicVocabulary = (topic?: Topic, count = 8) => {
  if (!topic) return getLocalVocabulary(count);
  const keywordsByTopic: Record<string, string[]> = {
    history: ['history', 'war', 'empire', 'king', 'city', 'culture'],
    aviation: ['air', 'flight', 'plane', 'pilot', 'engine', 'airport'],
    f1: ['race', 'car', 'track', 'driver', 'team', 'engine'],
    news: ['government', 'market', 'economy', 'company', 'city', 'people']
  };
  const keywords = keywordsByTopic[topic] || [];
  const matches = keywords.flatMap(keyword => LOCAL_VOCAB_EN_INDEX.get(keyword) || []);
  const unique = Array.from(new Map(matches.map(item => [item.de, item])).values());
  if (unique.length >= count) return pickRandomItems(unique, count);
  return [...unique, ...getLocalVocabulary(count - unique.length)];
};

const buildContextSentences = (count: number, level: Level, topic?: Topic, vocab?: VocabularyEntry[]) => {
  const contextVocab = vocab ?? getTopicVocabulary(topic, Math.max(6, Math.ceil(count / 2)));
  const sentences: GeneratedSentence[] = [];
  for (let i = 0; i < count; i += 1) {
    sentences.push(buildContextSentence(level, contextVocab, topic));
  }
  return sentences;
};

const getSentencePool = async (count: number, level: Level, topic?: Topic, contextVocab?: VocabularyEntry[]) => {
  const query = topic || 'Deutschland';
  const remoteSentences = await fetchRemoteSentences(query, level, Math.max(2, Math.floor(count / 3)));
  const localSentences = getLocalSentences(count);
  const generated = buildContextSentences(count, level, topic, contextVocab);
  const combined = shuffleArray([...remoteSentences, ...localSentences, ...generated]);
  return combined.slice(0, count);
};

const getVocabularyPool = async (count: number, topic?: Topic) => {
  const query = topic || 'Deutschland';
  const remote = await fetchRemoteVocabulary(query, Math.max(4, Math.floor(count / 2)));
  if (remote.length >= count) return remote.slice(0, count);
  const local = getTopicVocabulary(topic, count - remote.length);
  return shuffleArray([...remote, ...local]).slice(0, count);
};

export const getReadingFallback = (topic: Topic): GeneratedText | null => {
  const localMatch = LOCAL_READINGS.find(item => item.topic === topic);
  if (localMatch) {
    return {
      id: localMatch.id,
      title: localMatch.title,
      content: localMatch.content,
      topic,
      questions: localMatch.questions
    };
  }
  return null;
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

function buildSimilarEnglishOptions(sentence: GeneratedSentence, sentences: GeneratedSentence[]) {
  const correct = sentence.english;
  const sameSubject = sentences.filter(item => item.english !== correct && item.meta.subject.en === sentence.meta.subject.en);
  const sameVerb = sentences.filter(item => item.english !== correct && item.meta.verbBase.infinitive === sentence.meta.verbBase.infinitive);
  const sameCategory = sentence.meta.object.category
    ? sentences.filter(item => item.english !== correct && item.meta.object.category === sentence.meta.object.category)
    : [];
  const fallback = sentences.filter(item => item.english !== correct);
  const pool = Array.from(new Set([...sameSubject, ...sameVerb, ...sameCategory, ...fallback].map(item => item.english)));
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
  const options = shuffleArray([correct, ...unique.filter(item => item !== correct)]).slice(0, 4);
  if (!options.includes(correct)) {
    options[Math.floor(Math.random() * options.length)] = correct;
  }
  return shuffleArray(options);
}

function buildVocabularyOptions(sentence: GeneratedSentence) {
  const correct = sentence.meta.object.en;
  const optionsPool = sentence.meta.object.category
    ? wordPools.objects.filter(item => item.category === sentence.meta.object.category).map(item => item.en)
    : wordPools.objects.map(item => item.en);
  const unique = Array.from(new Set(optionsPool.filter(item => item !== correct)));
  const options = shuffleArray([correct, ...unique]).slice(0, 4);
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
  const contextVocab = await getVocabularyPool(Math.max(8, count + 6));
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
        options: buildVocabularyOptions(sentence),
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

export function generateReadingText(topic: Topic): GeneratedText {
  const pool = topicPools[topic];
  if (!pool) {
    throw new Error(`No pool for topic ${topic}`);
  }

  const sentences: string[] = [];
  
  // Sentence 1: S + V + O
  const s1 = getRandomItem(pool.subjects);
  const v1 = getRandomItem(pool.verbs);
  const o1 = getRandomItem(pool.objects);
  sentences.push(`${s1.de} ${v1.de} ${o1.de}.`);

  // Sentence 2: S + V + Adjective
  const s2 = getRandomItem(pool.subjects);
  const adj2 = getRandomItem(pool.adjectives);
  sentences.push(`${s2.de} ist sehr ${adj2.de}.`);

  // Sentence 3: Generic wrap up
  const s3 = getRandomItem(pool.subjects);
  const v3 = getRandomItem(pool.verbs);
  sentences.push(`${s3.de} ${v3.de} oft.`);

  const content = sentences.join(' ');
  const title = `Ein Text über ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;

  // Generate a simple comprehension question based on Sentence 2
  const questionText = `Was ist ${adj2.de}?`; 
  
  // Create distractors
  const distractors = [
    s1.de,
    o1.de,
    "Nichts"
  ].filter(d => d !== s2.de); 
  
  const options = [s2.de, ...distractors].sort(() => Math.random() - 0.5);
  const correctIndex = options.indexOf(s2.de);

  return {
    id: Math.random().toString(36).substr(2, 9),
    title,
    content,
    topic,
    questions: [{
      question: questionText,
      options,
      correctIndex
    }]
  };
}
