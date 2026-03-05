import { wordPools, conjugations, pastConjugations, topicPools } from '../data/wordPools';
import { Topic } from '../types';

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

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getLevelConfig(level: Level) {
  return {
    includeLocation: level !== 'A0',
    includeAdjective: level === 'A2' || level === 'B1',
    includeAdverb: level === 'B1'
  };
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
  const object = getRandomItem(objectPool);

  const { includeLocation, includeAdjective, includeAdverb } = getLevelConfig(level);
  const adjective = includeAdjective ? getRandomItem(wordPools.adjectives) : null;
  const adverb = includeAdverb ? getRandomItem(wordPools.adverbs) : null;
  const location = includeLocation ? getRandomItem(wordPools.locations) : null;

  const objectDe = adjective ? `${adjective.de} ${object.de}` : object.de;
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

function buildEnglishOptions(correct: string, pool: string[]) {
  const unique = Array.from(new Set(pool.filter(item => item !== correct)));
  const options = shuffleArray([correct, ...unique]).slice(0, 4);
  if (!options.includes(correct)) {
    options[Math.floor(Math.random() * options.length)] = correct;
  }
  return shuffleArray(options);
}

function buildVerbOptions(sentence: GeneratedSentence) {
  const personKey = `${sentence.meta.subject.person}${sentence.meta.subject.number === 'singular' ? 's' : 'p'}`;
  const verbs = wordPools.verbs.map(verb => conjugations[verb.infinitive || '']?.[personKey] || verb.de);
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
  const objectPool = filteredObjects.length > 0 ? filteredObjects : wordPools.objects;
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
  const optionsPool = wordPools.objects.map(item => item.en);
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

export function generateExercises({
  count = 5,
  level = 'A1',
  type = 'sentence_reconstruction'
}: {
  count?: number;
  level?: Level;
  type?: ExerciseType;
}): ExerciseItem[] {
  const sentences = Array.from({ length: count + 10 }, () => generateSimpleSentence(level));
  const englishPool = sentences.map(sentence => sentence.english);

  return Array.from({ length: count }, (_, index) => {
    const sentence = sentences[index];
    const id = `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`;

    if (type === 'multiple_choice') {
      return {
        id,
        type,
        level,
        prompt: sentence.german,
        options: buildEnglishOptions(sentence.english, englishPool),
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
      // Pick 4 pairs
      const pairs = sentences.slice(index, index + 4).map(s => ({
         left: s.meta.object.de,
         right: s.meta.object.en
      }));
      return {
        id,
        type,
        level,
        prompt: "Match the German words to English",
        answer: JSON.stringify(pairs), // Just storage
        pairs
      };
    }

    // Default fallback
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

export function generateBlock(concept: string, level: Level): ExerciseItem[] {
    // Concept can be mapped to exercise type
    let type: ExerciseType = 'sentence_reconstruction';
    if (concept.includes('vocabulary') || concept.includes('words')) type = 'vocabulary';
    else if (concept.includes('grammar') || concept.includes('cloze')) type = 'fill_blank';
    else if (concept.includes('tense')) type = 'tense';
    else if (concept.includes('matching')) type = 'vocabulary_matching';
    else if (concept.includes('choice')) type = 'multiple_choice';

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
