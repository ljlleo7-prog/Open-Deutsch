import { supabase } from './supabase';
import { Level, Stage, Lesson, Block, UserBlockProgress, UserXP } from '../types';
import { generateBlock } from './generator';

export const api = {
  // Levels & Stages
  async getLevels() {
    const { data, error } = await supabase
      .from('opendeutsch_levels')
      .select('*')
      .order('order_index');
    if (error) throw error;
    return data as Level[];
  },

  async getStages(levelId: string) {
    const { data, error } = await supabase
      .from('opendeutsch_stages')
      .select('*')
      .eq('level_id', levelId)
      .order('order_index');
    if (error) throw error;
    return data as Stage[];
  },

  async getLessons(stageId: string) {
    const { data, error } = await supabase
      .from('opendeutsch_lessons')
      .select('*')
      .eq('stage_id', stageId)
      .order('order_index');
    if (error) throw error;
    return data as Lesson[];
  },

  // Blocks
  async getBlocks(lessonId: string) {
    // In a real app, blocks might be in the DB. 
    // Here we might generate them on the fly if they don't exist, 
    // or just fetch definitions and then generate content.
    // For this implementation, we assume block DEFINITIONS are in DB (or implied)
    // but we will generate the content client-side using the generator.
    
    // Check if we have block definitions in DB
    const { data, error } = await supabase
      .from('opendeutsch_blocks')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order_index');
      
    if (error) throw error;
    return data as Block[];
  },

  // Progress
  async getUserProgress() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('opendeutsch_user_block_progress')
      .select('*')
      .eq('user_id', user.id);
      
    if (error) throw error;
    return data as UserBlockProgress[];
  },

  async getUserXP() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('opendeutsch_user_xp')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data as UserXP[];
  },

  async saveBlockProgress(blockId: string, score: number, passed: boolean, mastered: boolean, xpEarned: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Fetch existing progress to handle "highest XP" rule
    const { data: existing } = await supabase
      .from('opendeutsch_user_block_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('block_id', blockId)
      .single();

    let finalXp = xpEarned;
    if (existing && existing.xp_earned > xpEarned) {
      finalXp = existing.xp_earned; // Keep highest
    }

    const status = mastered ? 'mastered' : passed ? 'passed' : 'failed';

    const { error } = await supabase
      .from('opendeutsch_user_block_progress')
      .upsert({
        user_id: user.id,
        block_id: blockId,
        score,
        xp_earned: finalXp,
        status,
        last_attempt_at: new Date().toISOString(),
        attempts: (existing?.attempts || 0) + 1
      });

    if (error) throw error;
    
    // Update Total XP Categories (Simplified logic here, ideally backend trigger)
    // We would need to know the block type to assign to category.
    // For now, let's assume the client handles category updates or we do it separately.
  },
  
  // Content Generation Wrapper
  generateBlockContent(block: Block, level: Level['id']) {
      const validLevels = ['A0', 'A1', 'A2', 'B1'] as const;
      const normalizedLevel = validLevels.includes(level as (typeof validLevels)[number])
        ? (level as (typeof validLevels)[number])
        : 'A1';
      return generateBlock(block.concept, normalizedLevel);
  }
};
