
export type Level = 'A0' | 'A1' | 'A2' | 'B1';

export interface GeneratedSentence {
  german: string;
  english: string;
  chinese?: string; // Chinese translation
  grammarFocus?: string; // e.g. 'accusative case', 'modal verbs'
  structure?: string; // e.g. 'S-V-O', 'S-V-IO-DO'
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
