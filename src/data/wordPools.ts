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
    { de: 'Die Studentin', en: 'The student (f)', type: 'noun', person: 3, number: 'singular', gender: 'f', level: 'A1' },

    // A2 People/Professions
    // (Merged into main list below)

    { de: 'Die Studentin', en: 'The student (f)', type: 'noun', person: 3, number: 'singular', gender: 'f', level: 'A1' },
    { de: 'Der Ingenieur', en: 'The engineer (m)', type: 'noun', person: 3, number: 'singular', gender: 'm', plural: 'Die Ingenieure', level: 'A2' },
    { de: 'Die Ingenieurin', en: 'The engineer (f)', type: 'noun', person: 3, number: 'singular', gender: 'f', plural: 'Die Ingenieurinnen', level: 'A2' },
    { de: 'Der Arzt', en: 'The doctor (m)', type: 'noun', person: 3, number: 'singular', gender: 'm', plural: 'Die Ärzte', level: 'A2' },
    { de: 'Die Ärztin', en: 'The doctor (f)', type: 'noun', person: 3, number: 'singular', gender: 'f', plural: 'Die Ärztinnen', level: 'A2' },
    { de: 'Der Nachbar', en: 'The neighbor (m)', type: 'noun', person: 3, number: 'singular', gender: 'm', plural: 'Die Nachbarn', level: 'A2' },
    { de: 'Die Nachbarin', en: 'The neighbor (f)', type: 'noun', person: 3, number: 'singular', gender: 'f', plural: 'Die Nachbarinnen', level: 'A2' },
    { de: 'Der Kollege', en: 'The colleague (m)', type: 'noun', person: 3, number: 'singular', gender: 'm', plural: 'Die Kollegen', level: 'A2' },
    { de: 'Die Kollegin', en: 'The colleague (f)', type: 'noun', person: 3, number: 'singular', gender: 'f', plural: 'Die Kolleginnen', level: 'A2' },
    { de: 'Der Kunde', en: 'The customer (m)', type: 'noun', person: 3, number: 'singular', gender: 'm', plural: 'Die Kunden', level: 'A2' },
    { de: 'Die Kundin', en: 'The customer (f)', type: 'noun', person: 3, number: 'singular', gender: 'f', plural: 'Die Kundinnen', level: 'A2' },
    { de: 'Der Journalist', en: 'The journalist (m)', type: 'noun', person: 3, number: 'singular', gender: 'm', plural: 'Die Journalisten', level: 'B1' },
    { de: 'Die Journalistin', en: 'The journalist (f)', type: 'noun', person: 3, number: 'singular', gender: 'f', plural: 'Die Journalistinnen', level: 'B1' },
    { de: 'Der Wissenschaftler', en: 'The scientist (m)', type: 'noun', person: 3, number: 'singular', gender: 'm', plural: 'Die Wissenschaftler', level: 'B1' },
    { de: 'Die Wissenschaftlerin', en: 'The scientist (f)', type: 'noun', person: 3, number: 'singular', gender: 'f', plural: 'Die Wissenschaftlerinnen', level: 'B1' },
    { de: 'Der Chef', en: 'The boss (m)', type: 'noun', person: 3, number: 'singular', gender: 'm', plural: 'Die Chefs', level: 'B1' },
    { de: 'Die Chefin', en: 'The boss (f)', type: 'noun', person: 3, number: 'singular', gender: 'f', plural: 'Die Chefinnen', level: 'B1' },
    { de: 'Der Tourist', en: 'The tourist (m)', type: 'noun', person: 3, number: 'singular', gender: 'm', plural: 'Die Touristen', level: 'B1' },
    { de: 'Die Touristin', en: 'The tourist (f)', type: 'noun', person: 3, number: 'singular', gender: 'f', plural: 'Die Touristinnen', level: 'B1' },
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
    
    // A2 Verbs
    // (Merged into main list below)
    { de: 'wohne', en: 'live', infinitive: 'wohnen', case: 'preposition', objectCategories: ['location'], level: 'A2' },
    { de: 'fahre', en: 'drive/travel', infinitive: 'fahren', case: 'preposition', objectCategories: ['location'], level: 'A2' },
    { de: 'reise', en: 'travel', infinitive: 'reisen', case: 'preposition', objectCategories: ['location'], level: 'A2' },
    { de: 'lese', en: 'read', infinitive: 'lesen', case: 'accusative', objectCategories: ['media', 'item'], level: 'A2' },
    { de: 'schreibe', en: 'write', infinitive: 'schreiben', case: 'accusative', objectCategories: ['media', 'item'], level: 'A2' },
    { de: 'spiele', en: 'play', infinitive: 'spielen', case: 'accusative', objectCategories: ['item', 'media'], level: 'A2' },
    { de: 'spreche', en: 'speak', infinitive: 'sprechen', case: 'preposition', objectCategories: ['language', 'person'], level: 'A2' },
    { de: 'frage', en: 'ask', infinitive: 'fragen', case: 'accusative', objectCategories: ['person'], level: 'A2' },
    { de: 'helfe', en: 'help', infinitive: 'helfen', case: 'dative', objectCategories: ['person'], level: 'A2' },
    { de: 'gebe', en: 'give', infinitive: 'geben', case: 'dative', objectCategories: ['person', 'item'], level: 'A2' },
    { de: 'nehme', en: 'take', infinitive: 'nehmen', case: 'accusative', objectCategories: ['item'], level: 'A2' },
    { de: 'schicke', en: 'send', infinitive: 'schicken', case: 'dative', objectCategories: ['person', 'item'], level: 'A2' },
    { de: 'koche', en: 'cook', infinitive: 'kochen', case: 'accusative', objectCategories: ['food'], level: 'A2' },
    { de: 'erkläre', en: 'explain', infinitive: 'erklären', case: 'accusative', objectCategories: ['item', 'person'], level: 'B1' },
    { de: 'entscheide', en: 'decide', infinitive: 'entscheiden', case: 'preposition', objectCategories: ['item'], level: 'B1' },
    { de: 'vergleiche', en: 'compare', infinitive: 'vergleichen', case: 'accusative', objectCategories: ['item'], level: 'B1' },
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
    { de: 'einen Tee', en: 'a tea', gender: 'm', category: 'drink', level: 'A2' },
    { de: 'einen Saft', en: 'a juice', gender: 'm', category: 'drink', level: 'A2' },
    { de: 'eine Limonade', en: 'a lemonade', gender: 'f', category: 'drink', level: 'A2' },
    { de: 'einen Salat', en: 'a salad', gender: 'm', category: 'food', level: 'A2' },
    { de: 'eine Suppe', en: 'a soup', gender: 'f', category: 'food', level: 'A2' },
    { de: 'einen Käse', en: 'a cheese', gender: 'm', category: 'food', level: 'A2' },
    { de: 'eine Kartoffel', en: 'a potato', gender: 'f', category: 'food', level: 'A2' },
    { de: 'ein Frühstück', en: 'a breakfast', gender: 'n', category: 'food', level: 'A2' },
    { de: 'ein Abendessen', en: 'a dinner', gender: 'n', category: 'food', level: 'A2' },
    
    // Vehicles
    { de: 'ein Auto', en: 'a car', gender: 'n', category: 'vehicle', level: 'A0' },
    { de: 'einen Zug', en: 'a train', gender: 'm', category: 'vehicle', level: 'A0' },
    { de: 'einen Bus', en: 'a bus', gender: 'm', category: 'vehicle', level: 'A0' },
    { de: 'ein Fahrrad', en: 'a bicycle', gender: 'n', category: 'vehicle', level: 'A1' },
    { de: 'ein Motorrad', en: 'a motorcycle', gender: 'n', category: 'vehicle', level: 'A2' },
    { de: 'ein Taxi', en: 'a taxi', gender: 'n', category: 'vehicle', level: 'A2' },
    { de: 'eine Straßenbahn', en: 'a tram', gender: 'f', category: 'vehicle', level: 'A2' },
    
    // Items
    { de: 'ein Buch', en: 'a book', gender: 'n', category: 'item', level: 'A0' },
    { de: 'einen Stift', en: 'a pen', gender: 'm', category: 'item', level: 'A0' },
    { de: 'eine Tasche', en: 'a bag', gender: 'f', category: 'item', level: 'A1' },
    { de: 'einen Tisch', en: 'a table', gender: 'm', category: 'item', level: 'A1' },
    { de: 'einen Stuhl', en: 'a chair', gender: 'm', category: 'item', level: 'A1' },
    { de: 'einen Laptop', en: 'a laptop', gender: 'm', category: 'item', level: 'A2' },
    { de: 'ein Handy', en: 'a mobile phone', gender: 'n', category: 'item', level: 'A2' },
    { de: 'eine Jacke', en: 'a jacket', gender: 'f', category: 'item', level: 'A2' },
    { de: 'einen Schlüssel', en: 'a key', gender: 'm', category: 'item', level: 'A2' },
    { de: 'eine Rechnung', en: 'a bill/invoice', gender: 'f', category: 'item', level: 'B1' },
    { de: 'einen Vertrag', en: 'a contract', gender: 'm', category: 'item', level: 'B1' },
    
    // Media
    { de: 'eine Zeitung', en: 'a newspaper', gender: 'f', category: 'media', level: 'A1' },
    { de: 'einen Film', en: 'a movie', gender: 'm', category: 'media', level: 'A1' },
    { de: 'eine E-Mail', en: 'an email', gender: 'f', category: 'media', level: 'A2' },
    { de: 'ein Lied', en: 'a song', gender: 'n', category: 'media', level: 'A2' },
    { de: 'eine Serie', en: 'a series', gender: 'f', category: 'media', level: 'A2' },
    { de: 'einen Artikel', en: 'an article', gender: 'm', category: 'media', level: 'B1' },
    
    // People (as objects)
    { de: 'einen Freund', en: 'a friend', gender: 'm', category: 'person', level: 'A1' },
    { de: 'die Familie', en: 'the family', gender: 'f', category: 'person', level: 'A1' },
    { de: 'einen Kollegen', en: 'a colleague (m)', gender: 'm', category: 'person', level: 'A2' },
    { de: 'eine Kollegin', en: 'a colleague (f)', gender: 'f', category: 'person', level: 'A2' },
    { de: 'einen Nachbarn', en: 'a neighbor (m)', gender: 'm', category: 'person', level: 'A2' },
    { de: 'eine Nachbarin', en: 'a neighbor (f)', gender: 'f', category: 'person', level: 'A2' },
    { de: 'einen Kunden', en: 'a customer (m)', gender: 'm', category: 'person', level: 'B1' },
    { de: 'eine Kundin', en: 'a customer (f)', gender: 'f', category: 'person', level: 'B1' },
    
    // Languages
    { de: 'Deutsch', en: 'German', gender: 'n', category: 'language', level: 'A0' },
    { de: 'Englisch', en: 'English', gender: 'n', category: 'language', level: 'A0' },
    
    // A2 Food & Drink
    // (Merged into main list below)
    
    // A2 Tech & Items
    // (Merged into main list below)
    
    // B1 Abstract/Business
    // (Merged into main list below)
    { de: 'Spanisch', en: 'Spanish', gender: 'n', category: 'language', level: 'A2' },
    { de: 'Französisch', en: 'French', gender: 'n', category: 'language', level: 'A2' },
    { de: 'Italienisch', en: 'Italian', gender: 'n', category: 'language', level: 'B1' },
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

    // A2 Adjectives
    // (Merged into main list below)

    // B1 Adjectives
    // (Merged into main list below)
    { de: 'freundlich', en: 'friendly', level: 'A2' },
    { de: 'ruhig', en: 'calm', level: 'A2' },
    { de: 'laut', en: 'loud', level: 'A2' },
    { de: 'anstrengend', en: 'exhausting', level: 'A2' },
    { de: 'bequem', en: 'comfortable', level: 'A2' },
    { de: 'sauber', en: 'clean', level: 'A2' },
    { de: 'schmutzig', en: 'dirty', level: 'A2' },
    { de: 'gesund', en: 'healthy', level: 'A2' },
    { de: 'krank', en: 'ill', level: 'A2' },
    { de: 'pünktlich', en: 'punctual', level: 'B1' },
    { de: 'fleißig', en: 'hardworking', level: 'B1' },
    { de: 'wichtig', en: 'important', level: 'B1' },
    { de: 'möglich', en: 'possible', level: 'B1' },
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

    // A2 Adverbs
    // (Merged into main list below)

    // B1 Adverbs
    // (Merged into main list below)
    { de: 'meistens', en: 'mostly', level: 'A2' },
    { de: 'selten', en: 'rarely', level: 'A2' },
    { de: 'früh', en: 'early', level: 'A2' },
    { de: 'spät', en: 'late', level: 'A2' },
    { de: 'leider', en: 'unfortunately', level: 'A2' },
    { de: 'zum Glück', en: 'fortunately', level: 'A2' },
    { de: 'eigentlich', en: 'actually', level: 'B1' },
    { de: 'trotzdem', en: 'nevertheless', level: 'B1' },
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
    { de: 'im Krankenhaus', en: 'in the hospital', level: 'A2' },
    { de: 'in der Universität', en: 'at the university', level: 'A2' },
    { de: 'in der Bibliothek', en: 'in the library', level: 'A2' },
    { de: 'am Bahnhof', en: 'at the train station', level: 'A2' },
    { de: 'im Hotel', en: 'in the hotel', level: 'A2' },
    { de: 'in der Stadt', en: 'in the city', level: 'A2' },
    { de: 'im Ausland', en: 'abroad', level: 'B1' },
    { de: 'am Meer', en: 'at the sea', level: 'B1' },
    { de: 'bei der Arbeit', en: 'at work', level: 'B1' },
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
  },
  health: {
    subjects: [
      { de: 'Der Arzt', en: 'The doctor', person: 3, number: 'singular' },
      { de: 'Die Ärztin', en: 'The doctor (f)', person: 3, number: 'singular' },
      { de: 'Der Patient', en: 'The patient', person: 3, number: 'singular' },
    ],
    verbs: [
      { de: 'untersucht', en: 'examines', infinitive: 'untersuchen' },
      { de: 'hilft', en: 'helps', infinitive: 'helfen' },
      { de: 'braucht', en: 'needs', infinitive: 'brauchen' },
    ],
    objects: [
      { de: 'Medizin', en: 'medicine' },
      { de: 'Hilfe', en: 'help' },
      { de: 'einen Termin', en: 'an appointment' },
    ],
    adjectives: [
      { de: 'krank', en: 'sick' },
      { de: 'gesund', en: 'healthy' },
      { de: 'wichtig', en: 'important' },
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
  },
  'wohnen': {
    '1s': 'wohne', '2s': 'wohnst', '3s': 'wohnt',
    '1p': 'wohnen', '2p': 'wohnt', '3p': 'wohnen'
  },
  'fahren': {
    '1s': 'fahre', '2s': 'fährst', '3s': 'fährt',
    '1p': 'fahren', '2p': 'fahrt', '3p': 'fahren'
  },
  'reisen': {
    '1s': 'reise', '2s': 'reist', '3s': 'reist',
    '1p': 'reisen', '2p': 'reist', '3p': 'reisen'
  },
  'lesen': {
    '1s': 'lese', '2s': 'liest', '3s': 'liest',
    '1p': 'lesen', '2p': 'lest', '3p': 'lesen'
  },
  'schreiben': {
    '1s': 'schreibe', '2s': 'schreibst', '3s': 'schreibt',
    '1p': 'schreiben', '2p': 'schreibt', '3p': 'schreiben'
  },
  'spielen': {
    '1s': 'spiele', '2s': 'spielst', '3s': 'spielt',
    '1p': 'spielen', '2p': 'spielt', '3p': 'spielen'
  },
  'sprechen': {
    '1s': 'spreche', '2s': 'sprichst', '3s': 'spricht',
    '1p': 'sprechen', '2p': 'sprecht', '3p': 'sprechen'
  },
  'fragen': {
    '1s': 'frage', '2s': 'fragst', '3s': 'fragt',
    '1p': 'fragen', '2p': 'fragt', '3p': 'fragen'
  },
  'helfen': {
    '1s': 'helfe', '2s': 'hilfst', '3s': 'hilft',
    '1p': 'helfen', '2p': 'helft', '3p': 'helfen'
  },
  'geben': {
    '1s': 'gebe', '2s': 'gibst', '3s': 'gibt',
    '1p': 'geben', '2p': 'gebt', '3p': 'geben'
  },
  'nehmen': {
    '1s': 'nehme', '2s': 'nimmst', '3s': 'nimmt',
    '1p': 'nehmen', '2p': 'nehmt', '3p': 'nehmen'
  },
  'schicken': {
    '1s': 'schicke', '2s': 'schickst', '3s': 'schickt',
    '1p': 'schicken', '2p': 'schickt', '3p': 'schicken'
  },
  'kochen': {
    '1s': 'koche', '2s': 'kochst', '3s': 'kocht',
    '1p': 'kochen', '2p': 'kocht', '3p': 'kochen'
  },
  'erklären': {
    '1s': 'erkläre', '2s': 'erklärst', '3s': 'erklärt',
    '1p': 'erklären', '2p': 'erklärt', '3p': 'erklären'
  },
  'entscheiden': {
    '1s': 'entscheide', '2s': 'entscheidest', '3s': 'entscheidet',
    '1p': 'entscheiden', '2p': 'entscheidet', '3p': 'entscheiden'
  },
  'vergleichen': {
    '1s': 'vergleiche', '2s': 'vergleichst', '3s': 'vergleicht',
    '1p': 'vergleichen', '2p': 'vergleicht', '3p': 'vergleichen'
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
  },
  'wohnen': {
    '1s': 'wohnte', '2s': 'wohntest', '3s': 'wohnte',
    '1p': 'wohnten', '2p': 'wohntet', '3p': 'wohnten'
  },
  'fahren': {
    '1s': 'fuhr', '2s': 'fuhrst', '3s': 'fuhr',
    '1p': 'fuhren', '2p': 'fuhrt', '3p': 'fuhren'
  },
  'reisen': {
    '1s': 'reiste', '2s': 'reistest', '3s': 'reiste',
    '1p': 'reisten', '2p': 'reistet', '3p': 'reisten'
  },
  'lesen': {
    '1s': 'las', '2s': 'last', '3s': 'las',
    '1p': 'lasen', '2p': 'last', '3p': 'lasen'
  },
  'schreiben': {
    '1s': 'schrieb', '2s': 'schriebst', '3s': 'schrieb',
    '1p': 'schrieben', '2p': 'schriebt', '3p': 'schrieben'
  },
  'spielen': {
    '1s': 'spielte', '2s': 'spieltest', '3s': 'spielte',
    '1p': 'spielten', '2p': 'spieltet', '3p': 'spielten'
  },
  'sprechen': {
    '1s': 'sprach', '2s': 'sprachst', '3s': 'sprach',
    '1p': 'sprachen', '2p': 'spracht', '3p': 'sprachen'
  },
  'fragen': {
    '1s': 'fragte', '2s': 'fragtest', '3s': 'fragte',
    '1p': 'fragten', '2p': 'fragtet', '3p': 'fragten'
  },
  'helfen': {
    '1s': 'half', '2s': 'halfst', '3s': 'half',
    '1p': 'halfen', '2p': 'halft', '3p': 'halfen'
  },
  'geben': {
    '1s': 'gab', '2s': 'gabst', '3s': 'gab',
    '1p': 'gaben', '2p': 'gabt', '3p': 'gaben'
  },
  'nehmen': {
    '1s': 'nahm', '2s': 'nahmst', '3s': 'nahm',
    '1p': 'nahmen', '2p': 'nahmt', '3p': 'nahmen'
  },
  'schicken': {
    '1s': 'schickte', '2s': 'schicktest', '3s': 'schickte',
    '1p': 'schickten', '2p': 'schicktet', '3p': 'schickten'
  },
  'kochen': {
    '1s': 'kochte', '2s': 'kochtest', '3s': 'kochte',
    '1p': 'kochten', '2p': 'kochtet', '3p': 'kochten'
  },
  'erklären': {
    '1s': 'erklärte', '2s': 'erklärtest', '3s': 'erklärte',
    '1p': 'erklärten', '2p': 'erklärtet', '3p': 'erklärten'
  },
  'entscheiden': {
    '1s': 'entschied', '2s': 'entschiedst', '3s': 'entschied',
    '1p': 'entschieden', '2p': 'entschiedet', '3p': 'entschieden'
  },
  'vergleichen': {
    '1s': 'verglich', '2s': 'verglichst', '3s': 'verglich',
    '1p': 'verglichen', '2p': 'verglicht', '3p': 'verglichen'
  }
};
