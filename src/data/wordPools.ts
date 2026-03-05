export interface WordItem {
  de: string;
  en: string;
  category?: string;
  gender?: 'm' | 'f' | 'n';
  plural?: string;
  infinitive?: string; // for verbs
  person?: number; // for subjects
  number?: 'singular' | 'plural'; // for subjects
  case?: string; // for verbs (accusative, dative, etc.)
  objectCategories?: string[]; // for verbs
  type?: string; // noun, pronoun, etc.
  level?: 'A0' | 'A1' | 'A2' | 'B1';
}

export const wordPools = {
  subjects: [
    // Pronouns
    { de: 'Ich', en: 'I', type: 'pronoun', person: 1, number: 'singular', level: 'A0' },
    { de: 'Du', en: 'You', type: 'pronoun', person: 2, number: 'singular', level: 'A0' },
    { de: 'Er', en: 'He', type: 'pronoun', person: 3, number: 'singular', level: 'A0' },
    { de: 'Sie', en: 'She', type: 'pronoun', person: 3, number: 'singular', level: 'A0' },
    { de: 'Es', en: 'It', type: 'pronoun', person: 3, number: 'singular', level: 'A0' },
    { de: 'Wir', en: 'We', type: 'pronoun', person: 1, number: 'plural', level: 'A0' },
    { de: 'Ihr', en: 'You (plural)', type: 'pronoun', person: 2, number: 'plural', level: 'A0' },
    { de: 'Sie', en: 'They/You (formal)', type: 'pronoun', person: 3, number: 'plural', level: 'A0' },
    
    // People
    { de: 'Der Mann', en: 'The man', type: 'noun', person: 3, number: 'singular', gender: 'm', level: 'A0' },
    { de: 'Die Frau', en: 'The woman', type: 'noun', person: 3, number: 'singular', gender: 'f', level: 'A0' },
    { de: 'Das Kind', en: 'The child', type: 'noun', person: 3, number: 'singular', gender: 'n', level: 'A0' },
    { de: 'Der Junge', en: 'The boy', type: 'noun', person: 3, number: 'singular', gender: 'm', level: 'A0' },
    { de: 'Das Mädchen', en: 'The girl', type: 'noun', person: 3, number: 'singular', gender: 'n', level: 'A0' },
    { de: 'Der Lehrer', en: 'The teacher (m)', type: 'noun', person: 3, number: 'singular', gender: 'm', level: 'A1' },
    { de: 'Die Lehrerin', en: 'The teacher (f)', type: 'noun', person: 3, number: 'singular', gender: 'f', level: 'A1' },
    { de: 'Der Student', en: 'The student (m)', type: 'noun', person: 3, number: 'singular', gender: 'm', level: 'A1' },
  ] as WordItem[],
  
  verbs: [
    // Basic A0 Verbs
    { de: 'bin', en: 'am', infinitive: 'sein', case: 'nominative', objectCategories: ['adjective', 'noun', 'location'], level: 'A0' },
    { de: 'habe', en: 'have', infinitive: 'haben', case: 'accusative', objectCategories: ['item', 'food', 'drink', 'vehicle', 'person'], level: 'A0' },
    { de: 'gehe', en: 'go', infinitive: 'gehen', case: 'preposition', objectCategories: ['location'], level: 'A0' },
    { de: 'komme', en: 'come', infinitive: 'kommen', case: 'preposition', objectCategories: ['location'], level: 'A0' },
    
    // A1 Verbs
    { de: 'sehe', en: 'see', infinitive: 'sehen', case: 'accusative', objectCategories: ['vehicle', 'food', 'drink', 'media', 'item', 'person'], level: 'A1' },
    { de: 'kaufe', en: 'buy', infinitive: 'kaufen', case: 'accusative', objectCategories: ['vehicle', 'food', 'drink', 'media', 'item'], level: 'A1' },
    { de: 'besuche', en: 'visit', infinitive: 'besuchen', case: 'accusative', objectCategories: ['person', 'location'], level: 'A1' },
    { de: 'esse', en: 'eat', infinitive: 'essen', case: 'accusative', objectCategories: ['food'], level: 'A1' },
    { de: 'trinke', en: 'drink', infinitive: 'trinken', case: 'accusative', objectCategories: ['drink'], level: 'A1' },
    { de: 'suche', en: 'search for', infinitive: 'suchen', case: 'accusative', objectCategories: ['item', 'media', 'person', 'vehicle'], level: 'A1' },
    { de: 'brauche', en: 'need', infinitive: 'brauchen', case: 'accusative', objectCategories: ['item', 'food', 'drink', 'vehicle'], level: 'A1' },
    { de: 'möchte', en: 'would like', infinitive: 'möchten', case: 'accusative', objectCategories: ['item', 'food', 'drink'], level: 'A1' },
    { de: 'lerne', en: 'learn', infinitive: 'lernen', case: 'accusative', objectCategories: ['language', 'skill'], level: 'A1' },
    { de: 'arbeite', en: 'work', infinitive: 'arbeiten', case: 'preposition', objectCategories: ['location'], level: 'A1' },
  ] as WordItem[],
  
  objects: [
    // Food & Drink
    { de: 'einen Apfel', en: 'an apple', gender: 'm', category: 'food', level: 'A0' },
    { de: 'eine Banane', en: 'a banana', gender: 'f', category: 'food', level: 'A0' },
    { de: 'ein Brot', en: 'a bread', gender: 'n', category: 'food', level: 'A0' },
    { de: 'einen Kaffee', en: 'a coffee', gender: 'm', category: 'drink', level: 'A0' },
    { de: 'ein Wasser', en: 'water', gender: 'n', category: 'drink', level: 'A0' },
    { de: 'ein Bier', en: 'a beer', gender: 'n', category: 'drink', level: 'A1' },
    { de: 'eine Pizza', en: 'a pizza', gender: 'f', category: 'food', level: 'A1' },
    
    // Vehicles
    { de: 'ein Auto', en: 'a car', gender: 'n', category: 'vehicle', level: 'A0' },
    { de: 'einen Zug', en: 'a train', gender: 'm', category: 'vehicle', level: 'A0' },
    { de: 'einen Bus', en: 'a bus', gender: 'm', category: 'vehicle', level: 'A0' },
    { de: 'ein Fahrrad', en: 'a bicycle', gender: 'n', category: 'vehicle', level: 'A1' },
    
    // Items
    { de: 'ein Buch', en: 'a book', gender: 'n', category: 'item', level: 'A0' },
    { de: 'einen Stift', en: 'a pen', gender: 'm', category: 'item', level: 'A0' },
    { de: 'eine Tasche', en: 'a bag', gender: 'f', category: 'item', level: 'A1' },
    { de: 'einen Tisch', en: 'a table', gender: 'm', category: 'item', level: 'A1' },
    { de: 'einen Stuhl', en: 'a chair', gender: 'm', category: 'item', level: 'A1' },
    
    // Media
    { de: 'eine Zeitung', en: 'a newspaper', gender: 'f', category: 'media', level: 'A1' },
    { de: 'einen Film', en: 'a movie', gender: 'm', category: 'media', level: 'A1' },
    
    // People (as objects)
    { de: 'einen Freund', en: 'a friend', gender: 'm', category: 'person', level: 'A1' },
    { de: 'die Familie', en: 'the family', gender: 'f', category: 'person', level: 'A1' },
    
    // Languages
    { de: 'Deutsch', en: 'German', gender: 'n', category: 'language', level: 'A0' },
    { de: 'Englisch', en: 'English', gender: 'n', category: 'language', level: 'A0' },
  ] as WordItem[],
  
  adjectives: [
    { de: 'groß', en: 'big', level: 'A0' },
    { de: 'klein', en: 'small', level: 'A0' },
    { de: 'gut', en: 'good', level: 'A0' },
    { de: 'schlecht', en: 'bad', level: 'A0' },
    { de: 'schön', en: 'beautiful', level: 'A0' },
    { de: 'neu', en: 'new', level: 'A0' },
    { de: 'alt', en: 'old', level: 'A0' },
    { de: 'teuer', en: 'expensive', level: 'A1' },
    { de: 'billig', en: 'cheap', level: 'A1' },
    { de: 'heiß', en: 'hot', level: 'A1' },
    { de: 'kalt', en: 'cold', level: 'A1' },
    { de: 'schnell', en: 'fast', level: 'A1' },
    { de: 'langsam', en: 'slow', level: 'A1' },
  ] as WordItem[],
  
  adverbs: [
    { de: 'oft', en: 'often', level: 'A1' },
    { de: 'nie', en: 'never', level: 'A1' },
    { de: 'immer', en: 'always', level: 'A1' },
    { de: 'manchmal', en: 'sometimes', level: 'A1' },
    { de: 'heute', en: 'today', level: 'A0' },
    { de: 'morgen', en: 'tomorrow', level: 'A0' },
    { de: 'gestern', en: 'yesterday', level: 'A1' },
    { de: 'gern', en: 'gladly', level: 'A1' },
    { de: 'hier', en: 'here', level: 'A0' },
    { de: 'dort', en: 'there', level: 'A0' },
  ] as WordItem[],
  
  locations: [
    { de: 'in Berlin', en: 'in Berlin', level: 'A0' },
    { de: 'in Deutschland', en: 'in Germany', level: 'A0' },
    { de: 'zu Hause', en: 'at home', level: 'A0' },
    { de: 'in der Schule', en: 'at school', level: 'A1' },
    { de: 'im Büro', en: 'in the office', level: 'A1' },
    { de: 'im Park', en: 'in the park', level: 'A1' },
    { de: 'im Restaurant', en: 'in the restaurant', level: 'A1' },
    { de: 'im Supermarkt', en: 'in the supermarket', level: 'A1' },
    { de: 'nach Hause', en: 'home (direction)', level: 'A1' },
  ] as WordItem[]
};

export const topicPools: Record<string, { subjects: WordItem[], verbs: WordItem[], objects: WordItem[], adjectives: WordItem[] }> = {
  history: {
    subjects: [
      { de: 'Die Mauer', en: 'The Wall', person: 3, number: 'singular' },
      { de: 'Der König', en: 'The King', person: 3, number: 'singular' },
      { de: 'Das Volk', en: 'The people', person: 3, number: 'singular' },
    ],
    verbs: [
      { de: 'war', en: 'was', infinitive: 'sein' },
      { de: 'baute', en: 'built', infinitive: 'bauen' },
      { de: 'teilte', en: 'divided', infinitive: 'teilen' },
    ],
    objects: [
      { de: 'die Stadt', en: 'the city' },
      { de: 'das Land', en: 'the country' },
      { de: 'eine Grenze', en: 'a border' },
    ],
    adjectives: [
      { de: 'groß', en: 'big' },
      { de: 'wichtig', en: 'important' },
      { de: 'historisch', en: 'historical' },
    ]
  },
  f1: {
    subjects: [
      { de: 'Der Fahrer', en: 'The driver', person: 3, number: 'singular' },
      { de: 'Das Auto', en: 'The car', person: 3, number: 'singular' },
      { de: 'Das Team', en: 'The team', person: 3, number: 'singular' },
    ],
    verbs: [
      { de: 'fährt', en: 'drives', infinitive: 'fahren' },
      { de: 'gewinnt', en: 'wins', infinitive: 'gewinnen' },
      { de: 'stoppt', en: 'stops', infinitive: 'stoppen' },
    ],
    objects: [
      { de: 'das Rennen', en: 'the race' },
      { de: 'einen Pokal', en: 'a trophy' },
      { de: 'die Runde', en: 'the lap' },
    ],
    adjectives: [
      { de: 'schnell', en: 'fast' },
      { de: 'laut', en: 'loud' },
      { de: 'spannend', en: 'exciting' },
    ]
  },
  aviation: {
    subjects: [
      { de: 'Das Flugzeug', en: 'The airplane', person: 3, number: 'singular' },
      { de: 'Der Pilot', en: 'The pilot', person: 3, number: 'singular' },
      { de: 'Der Flughafen', en: 'The airport', person: 3, number: 'singular' },
    ],
    verbs: [
      { de: 'fliegt', en: 'flies', infinitive: 'fliegen' },
      { de: 'landet', en: 'lands', infinitive: 'landen' },
      { de: 'startet', en: 'starts/takes off', infinitive: 'starten' },
    ],
    objects: [
      { de: 'nach Berlin', en: 'to Berlin' },
      { de: 'viele Passagiere', en: 'many passengers' },
      { de: 'hoch', en: 'high' },
    ],
    adjectives: [
      { de: 'hoch', en: 'high' },
      { de: 'sicher', en: 'safe' },
      { de: 'modern', en: 'modern' },
    ]
  },
  news: {
    subjects: [
      { de: 'Der Politiker', en: 'The politician', person: 3, number: 'singular' },
      { de: 'Das Wetter', en: 'The weather', person: 3, number: 'singular' },
      { de: 'Die Wirtschaft', en: 'The economy', person: 3, number: 'singular' },
    ],
    verbs: [
      { de: 'ist', en: 'is', infinitive: 'sein' },
      { de: 'ändert', en: 'changes', infinitive: 'ändern' },
      { de: 'wächst', en: 'grows', infinitive: 'wachsen' },
    ],
    objects: [
      { de: 'gut', en: 'good' },
      { de: 'schlecht', en: 'bad' },
      { de: 'neu', en: 'new' },
    ],
    adjectives: [
      { de: 'aktuell', en: 'current' },
      { de: 'interessant', en: 'interesting' },
      { de: 'global', en: 'global' },
    ]
  }
};

// Conjugation helpers
export const conjugations: Record<string, Record<string, string>> = {
  'sein': {
    '1s': 'bin', '2s': 'bist', '3s': 'ist',
    '1p': 'sind', '2p': 'seid', '3p': 'sind'
  },
  'haben': {
    '1s': 'habe', '2s': 'hast', '3s': 'hat',
    '1p': 'haben', '2p': 'habt', '3p': 'haben'
  },
  'gehen': {
    '1s': 'gehe', '2s': 'gehst', '3s': 'geht',
    '1p': 'gehen', '2p': 'geht', '3p': 'gehen'
  },
  'kommen': {
    '1s': 'komme', '2s': 'kommst', '3s': 'kommt',
    '1p': 'kommen', '2p': 'kommt', '3p': 'kommen'
  },
  'sehen': {
    '1s': 'sehe', '2s': 'siehst', '3s': 'sieht',
    '1p': 'sehen', '2p': 'seht', '3p': 'sehen'
  },
  'kaufen': {
    '1s': 'kaufe', '2s': 'kaufst', '3s': 'kauft',
    '1p': 'kaufen', '2p': 'kauft', '3p': 'kaufen'
  },
  'besuchen': {
    '1s': 'besuche', '2s': 'besuchst', '3s': 'besucht',
    '1p': 'besuchen', '2p': 'besucht', '3p': 'besuchen'
  },
  'essen': {
    '1s': 'esse', '2s': 'isst', '3s': 'isst',
    '1p': 'essen', '2p': 'esst', '3p': 'essen'
  },
  'trinken': {
    '1s': 'trinke', '2s': 'trinkst', '3s': 'trinkt',
    '1p': 'trinken', '2p': 'trinkt', '3p': 'trinken'
  },
  'suchen': {
    '1s': 'suche', '2s': 'suchst', '3s': 'sucht',
    '1p': 'suchen', '2p': 'sucht', '3p': 'suchen'
  },
  'brauchen': {
    '1s': 'brauche', '2s': 'brauchst', '3s': 'braucht',
    '1p': 'brauchen', '2p': 'braucht', '3p': 'brauchen'
  },
  'möchten': {
    '1s': 'möchte', '2s': 'möchtest', '3s': 'möchte',
    '1p': 'möchten', '2p': 'möchtet', '3p': 'möchten'
  },
  'lernen': {
    '1s': 'lerne', '2s': 'lernst', '3s': 'lernt',
    '1p': 'lernen', '2p': 'lernt', '3p': 'lernen'
  },
  'arbeiten': {
    '1s': 'arbeite', '2s': 'arbeitest', '3s': 'arbeitet',
    '1p': 'arbeiten', '2p': 'arbeitet', '3p': 'arbeiten'
  }
};

export const pastConjugations: Record<string, Record<string, string>> = {
  'sein': {
    '1s': 'war', '2s': 'warst', '3s': 'war',
    '1p': 'waren', '2p': 'wart', '3p': 'waren'
  },
  'haben': {
    '1s': 'hatte', '2s': 'hattest', '3s': 'hatte',
    '1p': 'hatten', '2p': 'hattet', '3p': 'hatten'
  },
  'sehen': {
    '1s': 'sah', '2s': 'sahst', '3s': 'sah',
    '1p': 'sahen', '2p': 'saht', '3p': 'sahen'
  },
  'kaufen': {
    '1s': 'kaufte', '2s': 'kauftest', '3s': 'kaufte',
    '1p': 'kauften', '2p': 'kauftet', '3p': 'kauften'
  },
  'besuchen': {
    '1s': 'besuchte', '2s': 'besuchtest', '3s': 'besuchte',
    '1p': 'besuchten', '2p': 'besuchtet', '3p': 'besuchten'
  },
  'essen': {
    '1s': 'aß', '2s': 'aßest', '3s': 'aß',
    '1p': 'aßen', '2p': 'aßt', '3p': 'aßen'
  },
  'trinken': {
    '1s': 'trank', '2s': 'trankst', '3s': 'trank',
    '1p': 'tranken', '2p': 'trankt', '3p': 'tranken'
  },
  'suchen': {
    '1s': 'suchte', '2s': 'suchtest', '3s': 'suchte',
    '1p': 'suchten', '2p': 'suchtet', '3p': 'suchten'
  },
  'lernen': {
    '1s': 'lernte', '2s': 'lerntest', '3s': 'lernte',
    '1p': 'lernten', '2p': 'lerntet', '3p': 'lernten'
  },
  'arbeiten': {
    '1s': 'arbeitete', '2s': 'arbeitetest', '3s': 'arbeitete',
    '1p': 'arbeiteten', '2p': 'arbeitetet', '3p': 'arbeiteten'
  }
};
