import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface UserProgress {
  lesson_id?: string;
  exercise_type: string;
  completed: boolean;
  score: number;
}

export async function fetchAuthUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

const fallbackLevelMultipliers: Record<string, number> = {
  A0: 1,
  A1: 1.1,
  A2: 1.25,
  B1: 1.5
};

function getWeekStart(date: Date) {
  const weekStart = new Date(date);
  const day = weekStart.getDay() || 7;
  weekStart.setDate(weekStart.getDate() - (day - 1));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

function getMonthStart(date: Date) {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);
  return monthStart;
}

async function ensureUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return null;

  const payload = {
    id: user.id,
    email: user.email,
    sso_provider: user.app_metadata?.provider ?? null,
    sso_subject: user.user_metadata?.sub ?? null,
    last_sign_in_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('opendeutsch_users')
    .upsert(payload)
    .select('id, email, official_level, total_xp, created_at')
    .maybeSingle();

  if (error) {
    console.error('Error ensuring profile:', error);
    return null;
  }

  return data;
}

export async function saveExerciseProgress(progress: UserProgress) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('opendeutsch_user_progress')
    .insert([
      {
        user_id: user.id,
        lesson_id: progress.lesson_id,
        exercise_type: progress.exercise_type,
        completed: progress.completed,
        score: progress.score,
        completed_at: new Date().toISOString()
      }
    ]);

  if (error) {
    console.error('Error saving progress:', error);
    return null;
  }
  return data;
}

export async function fetchUserStats() {
  const profile = await ensureUserProfile();
  if (!profile) return null;

  // Fetch completed exercises count
  const { count: completedCount, error: countError } = await supabase
    .from('opendeutsch_user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('completed', true);

  if (countError) console.error('Error fetching stats:', countError);

  // Fetch recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: activityData, error: activityError } = await supabase
    .from('opendeutsch_xp_events')
    .select('created_at')
    .eq('user_id', profile.id)
    .gte('created_at', sevenDaysAgo.toISOString());

  if (activityError) console.error('Error fetching activity:', activityError);

  return {
    totalXP: profile.total_xp ?? 0,
    completedExercises: completedCount || 0,
    activity: (activityData || []).map((entry: { completed_at?: string; created_at?: string }) => ({
      completed_at: entry.completed_at ?? entry.created_at ?? new Date().toISOString()
    }))
  };
}

export async function fetchUserProfile() {
  return ensureUserProfile();
}

export async function fetchSkillMetrics() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('opendeutsch_skill_metrics')
    .select('skill_type, mastery_percentage')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching skill metrics:', error);
    return [];
  }

  return data || [];
}

export async function fetchLevelRules() {
  const { data, error } = await supabase
    .from('opendeutsch_level_rules')
    .select('level, min_xp, xp_multiplier');

  if (error) {
    console.error('Error fetching level rules:', error);
    return [];
  }

  return data || [];
}

export async function awardXp({
  source,
  basePoints,
  metadata
}: {
  source: string;
  basePoints: number;
  metadata?: Record<string, unknown>;
}) {
  const profile = await ensureUserProfile();
  if (!profile) return null;

  const levelRules = await fetchLevelRules();
  const rule = levelRules.find(item => item.level === profile.official_level);
  const multiplier = rule?.xp_multiplier ?? fallbackLevelMultipliers[profile.official_level] ?? 1;
  const awardedPoints = basePoints * multiplier;

  const { error: eventError } = await supabase
    .from('opendeutsch_xp_events')
    .insert({
      user_id: profile.id,
      source,
      base_points: basePoints,
      multiplier,
      awarded_points: awardedPoints,
      metadata
    });

  if (eventError) {
    console.error('Error inserting xp event:', eventError);
    return null;
  }

  const nextTotal = (profile.total_xp ?? 0) + awardedPoints;
  const { error: totalError } = await supabase
    .from('opendeutsch_users')
    .update({ total_xp: nextTotal })
    .eq('id', profile.id);

  if (totalError) console.error('Error updating total XP:', totalError);

  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const monthStart = getMonthStart(now);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

  await updateXpPeriod(profile.id, 'weekly', weekStart, weekEnd, awardedPoints);
  await updateXpPeriod(profile.id, 'monthly', monthStart, monthEnd, awardedPoints);

  return {
    awardedPoints,
    multiplier,
    totalXP: nextTotal
  };
}

async function updateXpPeriod(
  userId: string,
  periodType: 'weekly' | 'monthly',
  periodStart: Date,
  periodEnd: Date,
  awardedPoints: number
) {
  const { data: existing } = await supabase
    .from('opendeutsch_xp_periods')
    .select('id, xp_earned')
    .eq('user_id', userId)
    .eq('period_type', periodType)
    .eq('period_start', periodStart.toISOString().slice(0, 10))
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from('opendeutsch_xp_periods')
      .update({
        xp_earned: (existing.xp_earned ?? 0) + awardedPoints,
        period_end: periodEnd.toISOString().slice(0, 10)
      })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('opendeutsch_xp_periods')
      .insert({
        user_id: userId,
        period_type: periodType,
        period_start: periodStart.toISOString().slice(0, 10),
        period_end: periodEnd.toISOString().slice(0, 10),
        xp_earned: awardedPoints
      });
  }
}

export async function updateUserInterests(topics: string[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Clear existing interests (simple approach)
  await supabase
    .from('opendeutsch_user_interests')
    .delete()
    .eq('user_id', user.id);

  // Insert new ones
  const interests = topics.map(topic => ({
    user_id: user.id,
    topic,
    weight: 1.5 // Default boost for selected topics
  }));

  const { error } = await supabase
    .from('opendeutsch_user_interests')
    .insert(interests);

  if (error) console.error('Error updating interests:', error);
}
