export interface UserProfile {
  id: string;
  email: string;
  official_level: 'A0' | 'A1' | 'A2' | 'B1';
  total_xp?: number;
  sso_provider?: string | null;
  last_sign_in_at?: string | null;
  created_at: string;
}

export type Topic = 'history' | 'f1' | 'aviation' | 'news';

export interface UserInterest {
  topic: Topic;
  weight: number;
}

export interface Level {
  id: string;
  name: string;
  description: string;
  total_xp_target: number;
  order_index: number;
}

export interface Stage {
  id: string;
  level_id: string;
  title: string;
  description: string;
  order_index: number;
}

export interface Lesson {
  id: string;
  title: string;
  level: string;
  stage_id: string;
  type: 'grammar' | 'vocabulary' | 'sentence' | 'word-order';
  description: string;
  order_index: number;
  concept: string;
  required_xp: number;
}

export interface Block {
  id: string;
  lesson_id: string;
  type: string;
  concept: string;
  order_index: number;
}

export interface UserBlockProgress {
  id: string;
  user_id: string;
  block_id: string;
  score: number;
  xp_earned: number;
  status: 'locked' | 'available' | 'passed' | 'mastered' | 'failed';
  attempts: number;
  last_attempt_at: string;
}

export interface UserXP {
  user_id: string;
  category: 'Vocabulary' | 'Grammar' | 'Sentence' | 'Reading' | 'Comprehension';
  amount: number;
  last_updated: string;
}

export interface WordPoolItem {
  id: string;
  category: string;
  value: string;
  level: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface ReadingText {
  id: string;
  title: string;
  content: string;
  level: string;
  topic: Topic;
  word_count: number;
}

export interface Question {
  id: string;
  text_id: string;
  question: string;
  options: string[];
  correct_index: number;
  type: 'comprehension' | 'vocabulary' | 'analytical';
}
