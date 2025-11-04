import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { scheduleHabitReminder, cancelHabitReminder, scheduleEmailReminder, notificationManager } from '../utils/notifications';
import { getBrowserTimeZone, getZoneOffsetMinutes, nextUtcInstantFromLocalTime } from '../utils/timeUtils';

type Habit = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  frequency: 'daily' | 'custom';
  active_days: number[];
  target_days: number;
  is_active: boolean;
  reminder_time: string | null;
  reminders_enabled: boolean;
  browser_notifications: boolean;
  email_notifications: boolean;
  snoozed_until: string | null;
  snooze_duration: number | null;
  category: string[];
  created_at: string;
  updated_at: string;
};

type PrebuiltHabit = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  frequency: 'daily' | 'weekly' | 'custom';
  target_days: number;
  category: string;
  is_default: boolean;
  is_template?: boolean;
  template_id?: string;
  created_at: string;
  updated_at: string;
};

type PrebuiltChallenge = {
  id: string;
  name: string;
  description: string;
  template_id: string | null;
  duration_days: number;
  goal_type: 'daily_completion' | 'total_count';
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

type Challenge = {
  id: string;
  user_id: string;
  prebuilt_challenge_id: string | null;
  name: string;
  description: string;
  linked_habit_id: string[];
  duration_days: number;
  goal_type: 'daily_completion' | 'total_count';
  goal_value: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
};

type PredefinedBadge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'milestones' | 'streaks' | 'consistency' | 'challenges' | 'special';
  trigger_type: 'total_habits' | 'total_completions' | 'longest_streak' | 'completion_rate' | 'challenge_completed' | 'days_active' | 'habit_created';
  trigger_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  created_at: string;
  badge?: PredefinedBadge;
};



type HabitCompletion = {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  notes: string;
  created_at: string;
};

type HabitHistory = {
  id: string;
  habit_id: string;
  user_id: string;
  habit_name: string;
  action: 'created' | 'updated' | 'deleted';
  changes: Record<string, any>;
  created_at: string;
};

type HabitsContextType = {
  habits: Habit[];
  prebuiltHabits: PrebuiltHabit[];
  prebuiltChallenges: PrebuiltChallenge[];
  challenges: Challenge[];
  completions: HabitCompletion[];
  history: HabitHistory[];
  loading: boolean;
  createHabit: (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'target_days'> & { target_days?: number }) => Promise<Habit>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompletion: (habitId: string, date: string) => Promise<void>;
  isCompleted: (habitId: string, date: string) => boolean;
  getStreak: (habitId: string) => number;
  snoozeHabit: (habitId: string, durationMinutes: number) => Promise<void>;
  unsnoozeHabit: (habitId: string) => Promise<void>;
  isHabitSnoozed: (habitId: string) => boolean;
  refreshHabits: () => Promise<void>;
  refreshCompletions: () => Promise<void>;
  loadHistory: () => Promise<void>;
  fetchPrebuiltHabits: () => Promise<PrebuiltHabit[]>;
  createPrebuiltHabit: (habit: Omit<PrebuiltHabit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<PrebuiltHabit>;
  updatePrebuiltHabit: (id: string, updates: Partial<PrebuiltHabit>) => Promise<void>;
  deletePrebuiltHabit: (id: string) => Promise<void>;
  seedDefaultPrebuiltHabits: () => Promise<void>;
  // Challenge functions
  fetchPrebuiltChallenges: () => Promise<PrebuiltChallenge[]>;
  fetchChallenges: () => Promise<Challenge[]>;
  createChallenge: (challenge: Omit<Challenge, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Challenge>;
  updateChallenge: (id: string, updates: Partial<Challenge>) => Promise<void>;
  deleteChallenge: (id: string) => Promise<void>;
  getChallengeProgress: (challengeId: string) => { completed: number; total: number; percentage: number };
  updateChallengeStatus: (challengeId: string) => Promise<void>;
  // Badge functions
  predefinedBadges: PredefinedBadge[];
  userBadges: UserBadge[];
  fetchPredefinedBadges: () => Promise<PredefinedBadge[]>;
  fetchUserBadges: () => Promise<UserBadge[]>;
  checkAndAwardBadges: () => Promise<void>;
  awardBadge: (badgeId: string) => Promise<void>;
  getUserStats: () => {
    totalHabits: number;
    totalCompletions: number;
    longestStreak: number;
    completionRate: number;
    completedChallenges: number;
    daysActive: number;
  };
};

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) throw new Error('useHabits must be used within a HabitsProvider');
  return context;
}

interface HabitsProviderProps {
  children: ReactNode;
}

export function HabitsProvider({ children }: HabitsProviderProps) {
  const { user, profile } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [prebuiltHabits, setPrebuiltHabits] = useState<PrebuiltHabit[]>([]);
  const [prebuiltChallenges, setPrebuiltChallenges] = useState<PrebuiltChallenge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [history, setHistory] = useState<HabitHistory[]>([]);
  const [predefinedBadges, setPredefinedBadges] = useState<PredefinedBadge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [badgesLoaded, setBadgesLoaded] = useState(false);

  const loadHabits = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadCompletions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user?.id);
      if (error) throw error;
      setCompletions(data || []);
    } catch (error) {
      console.error('Error loading completions:', error);
    }
  }, [user?.id]);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('habit_history')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }, [user]);

  // ——— Badge Functions ——— //
  async function fetchPredefinedBadges() {
    if (badgesLoaded) return predefinedBadges;
    const { data, error } = await supabase
      .from('predefined_badges')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setPredefinedBadges(data || []);
    setBadgesLoaded(true);
    return data || [];
  }

  async function fetchUserBadges() {
    if (!user || badgesLoaded) return userBadges;
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:predefined_badges(*)
      `)
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });
    if (error) throw error;
    setUserBadges(data || []);
    return data || [];
  }

  async function checkAndAwardBadges(habitsOverride?: Habit[], completionsOverride?: HabitCompletion[], challengesOverride?: Challenge[]) {
    if (!user) return;
    const stats = getUserStats(habitsOverride, completionsOverride, challengesOverride);
    const unearnedBadges = predefinedBadges.filter(badge =>
      !userBadges.some(ub => ub.badge_id === badge.id)
    );

    for (const badge of unearnedBadges) {
      let shouldAward = false;
      switch (badge.trigger_type) {
        case 'total_habits':
          shouldAward = stats.totalHabits >= badge.trigger_value;
          break;
        case 'total_completions':
          shouldAward = stats.totalCompletions >= badge.trigger_value;
          break;
        case 'longest_streak':
          shouldAward = stats.longestStreak >= badge.trigger_value;
          break;
        case 'completion_rate':
          shouldAward = stats.completionRate >= badge.trigger_value;
          break;
        case 'challenge_completed':
          shouldAward = stats.completedChallenges >= badge.trigger_value;
          break;
        case 'days_active':
          shouldAward = stats.daysActive >= badge.trigger_value;
          break;
        case 'habit_created':
          shouldAward = stats.totalHabits >= badge.trigger_value;
          break;
      }
      if (shouldAward) {
        await awardBadge(badge.id);
      }
    }
  }

  async function awardBadge(badgeId: string) {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_badges')
      .insert({ user_id: user.id, badge_id: badgeId })
      .select()
      .single();
    if (error) throw error;
    setUserBadges([data, ...userBadges]);
  }

  function getUserStats(habitsOverride?: Habit[], completionsOverride?: HabitCompletion[], challengesOverride?: Challenge[]) {
    const habitsToUse = habitsOverride || habits;
    const completionsToUse = completionsOverride || completions;
    const challengesToUse = challengesOverride || challenges;

    const totalHabits = habitsToUse.length;
    const totalCompletions = completionsToUse.length;
    const longestStreak = Math.max(...habitsToUse.map(h => getStreak(h.id)), 0);

    // Calculate completion rate over the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCompletions = completionsToUse.filter(c => new Date(c.completed_date) >= thirtyDaysAgo);
    const completionRate = totalHabits > 0 ? Math.round((recentCompletions.length / (totalHabits * 30)) * 100) : 0;

    const completedChallenges = challengesToUse.filter(c => c.status === 'completed').length;
    const daysActive = new Set(completionsToUse.map(c => c.completed_date)).size;
    return {
      totalHabits,
      totalCompletions,
      longestStreak,
      completionRate,
      completedChallenges,
      daysActive,
    };
  }

  const setupNotifications = useCallback(() => {
    if (!notificationManager.isSupported()) return;
    notificationManager.requestPermission().then(permission => {
      if (permission.granted) {
        notificationManager.cancelAllScheduledNotifications();

        const effectiveTz = (profile?.timezone && (profile?.timezone_manual || profile?.timezone)) ? profile.timezone : getBrowserTimeZone();

        // Schedule notifications and email reminders for habits with reminders enabled
        habits.forEach(habit => {
          if (habit.reminders_enabled && habit.reminder_time) {
            // Skip scheduling if habit is currently snoozed
            if (isHabitSnoozed(habit.id)) {
              return;
            }

            if (habit.browser_notifications) {
              scheduleHabitReminder(habit.id, habit.name, habit.reminder_time, effectiveTz);
            }
            // Also schedule email reminders if user has email and email notifications are enabled
            if (user?.email && habit.email_notifications) {
              scheduleEmailReminder(habit.id, habit.name, user.email, habit.reminder_time, effectiveTz);
            }
          }
        });
      }
    });
  }, [habits, user?.email, profile?.timezone, profile?.timezone_manual]);

  useEffect(() => {
    if (user) {
      loadHabits();
      loadCompletions();
      loadHistory();
      fetchPrebuiltHabits();
      fetchPrebuiltChallenges();
      fetchChallenges();
      fetchPredefinedBadges();
      fetchUserBadges();
      // Update challenge statuses and check for badges after initial load
      setTimeout(async () => {
        // Update status for all active challenges
        const activeChallenges = challenges.filter(c => c.status === 'active');
        for (const challenge of activeChallenges) {
          await updateChallengeStatus(challenge.id);
        }
        // Then check and award badges
        await checkAndAwardBadges();
      }, 1000); // Delay to ensure data is loaded
    } else {
      setHabits([]);
      setCompletions([]);
      setHistory([]);
      setPrebuiltHabits([]);
      setPrebuiltChallenges([]);
      setChallenges([]);
      setPredefinedBadges([]);
      setUserBadges([]);
      notificationManager.cancelAllScheduledNotifications();
      setLoading(false);
    }
  }, [user, loadHabits, loadCompletions, loadHistory]);

  useEffect(() => {
    if (user && habits.length > 0) setupNotifications();
  }, [habits, user, setupNotifications]);

  // Re-schedule on timezone/DST change
  const lastOffsetRef = useRef<number | null>(null);
  useEffect(() => {
    const tz = (profile?.timezone && (profile?.timezone_manual || profile?.timezone)) ? profile.timezone! : getBrowserTimeZone();
    const checkOffset = () => {
      const current = getZoneOffsetMinutes(tz);
      if (lastOffsetRef.current === null) {
        lastOffsetRef.current = current;
        return;
      }
      if (current !== lastOffsetRef.current) {
        lastOffsetRef.current = current;
        setupNotifications();
      }
    };
    const interval = setInterval(checkOffset, 60 * 60 * 1000); // hourly
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkOffset();
    });
    // Initial run
    checkOffset();
    return () => clearInterval(interval);
  }, [profile?.timezone, profile?.timezone_manual, setupNotifications]);



  async function createHabit(habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'target_days'> & { target_days?: number }) {
    if (!user) throw new Error('You must be logged in to create a habit.');
    const trimmedName = habit.name.trim().toLowerCase();
    // Check database for duplicates instead of local state to avoid issues with concurrent adds
    const { data: existing, error: checkError } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .ilike('name', trimmedName);
    if (checkError) throw checkError;
    if (existing && existing.length > 0) throw new Error('A habit with this name already exists.');
    const { data, error } = await supabase
      .from('habits')
      .insert({
        ...habit,
        user_id: user.id,
        active_days: habit.frequency === 'daily' ? [0,1,2,3,4,5,6] : habit.active_days,
        target_days: habit.target_days ?? 7,
      })
      .select()
      .single();
    if (error) throw error;
    setHabits([data, ...habits]);
    // Check for badges after creating habit
    await checkAndAwardBadges();
    return data;
  }

  async function updateHabit(id: string, updates: Partial<Habit>) {
    if (updates.name) {
      const name = updates.name.trim().toLowerCase();
      if (habits.find(h => h.id !== id && h.name.trim().toLowerCase() === name))
        throw new Error('A habit with this name already exists.');
    }
    // Ensure 'daily' habits save with all days
    if (updates.frequency === 'daily') {
      updates.active_days = [0, 1, 2, 3, 4, 5, 6];
    }

  let nextUtc: string | null | undefined = undefined;
    const effectiveTz = (profile?.timezone && (profile?.timezone_manual || profile?.timezone)) ? profile.timezone! : getBrowserTimeZone();
    if (updates.reminders_enabled === false || updates.reminder_time === null) {
  nextUtc = null; // explicit null to clear
    } else if (updates.reminders_enabled && updates.reminder_time) {
      nextUtc = nextUtcInstantFromLocalTime(updates.reminder_time, effectiveTz);
    }

    const { error } = await supabase
      .from('habits')
      .update({ ...updates, next_reminder_at_utc: nextUtc })
      .eq('id', id);

    if (error) throw error;
    setHabits(habits.map(h => h.id === id ? { ...h, ...updates } : h));
  }

  async function deleteHabit(id: string) {
    if (!user) return;

    // Fetch all challenges for the user
    const { data: allChallenges, error: queryError } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', user.id);

    if (queryError) throw queryError;

    // Filter challenges that contain this habit ID (works for both single and array)
    const challengesToDelete = allChallenges.filter(c =>
      Array.isArray(c.linked_habit_id) ? c.linked_habit_id.includes(id) : c.linked_habit_id === id
    );

    // Delete each challenge from DB
    if (challengesToDelete.length > 0) {
      const challengeIds = challengesToDelete.map(c => c.id);
      const { error: deleteError } = await supabase
        .from('challenges')
        .delete()
        .in('id', challengeIds);

      if (deleteError) throw deleteError;
    }

    // Deactivate the habit
    const { error } = await supabase.from('habits').update({ is_active: false }).eq('id', id);
    if (error) throw error;

    // Update local states
    setHabits(habits.filter(h => h.id !== id));
    await fetchChallenges(); // Refresh challenges state
    cancelHabitReminder(id);
  }

  async function toggleCompletion(habitId: string, date: string) {
    if (!user) return;
    const existing = completions.find(c => c.habit_id === habitId && c.completed_date === date);
    let newCompletions: HabitCompletion[];
    if (existing) {
      const { error } = await supabase.from('habit_completions').delete().eq('id', existing.id);
      if (error) throw error;
      newCompletions = completions.filter(c => c.id !== existing.id);
      setCompletions(newCompletions);
    } else {
      const { data, error } = await supabase
        .from('habit_completions')
        .insert({ habit_id: habitId, user_id: user.id, completed_date: date })
        .select()
        .single();
      if (error) throw error;
      newCompletions = [...completions, data];
      setCompletions(newCompletions);
    }
    // Update challenge statuses after completion change
    const activeChallenges = challenges.filter(c => c.status === 'active');
    for (const challenge of activeChallenges) {
      await updateChallengeStatus(challenge.id);
    }
    // Check for badges after completion change with updated completions
    await checkAndAwardBadges(undefined, newCompletions, undefined);
  }

  function isCompleted(habitId: string, date: string): boolean {
    return completions.some(c => c.habit_id === habitId && c.completed_date === date);
  }

  function getStreak(habitId: string): number {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;
    const activeDays = habit.frequency === 'daily' ? [0,1,2,3,4,5,6] : (habit.active_days || []);
    let streak = 0;
    const current = new Date();
    for (let i = 0; i < 365; i++) {
      const dow = current.getDay();
      if (activeDays.includes(dow)) {
        const dateStr = current.toISOString().split('T')[0];
        if (isCompleted(habitId, dateStr)) streak++;
        else break;
      }
      current.setDate(current.getDate() - 1);
    }
    return streak;
  }

  async function snoozeHabit(habitId: string, durationMinutes: number) {
    const until = new Date();
    until.setMinutes(until.getMinutes() + durationMinutes);
    const { error } = await supabase.from('habits').update({ snoozed_until: until.toISOString(), snooze_duration: durationMinutes }).eq('id', habitId);
    if (error) throw error;
    setHabits(habits.map(h => h.id === habitId ? { ...h, snoozed_until: until.toISOString(), snooze_duration: durationMinutes } : h));
    cancelHabitReminder(habitId);
  }

  async function unsnoozeHabit(habitId: string) {
    const { error } = await supabase.from('habits').update({ snoozed_until: null, snooze_duration: null }).eq('id', habitId);
    if (error) throw error;
    setHabits(habits.map(h => h.id === habitId ? { ...h, snoozed_until: null, snooze_duration: null } : h));
    const habit = habits.find(h => h.id === habitId);
    if (habit && habit.reminders_enabled && habit.reminder_time && habit.browser_notifications) {
      const effectiveTz = (profile?.timezone && (profile?.timezone_manual || profile?.timezone)) ? profile.timezone! : getBrowserTimeZone();
      scheduleHabitReminder(habit.id, habit.name, habit.reminder_time, effectiveTz);
    }
  }

  function isHabitSnoozed(habitId: string) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit || !habit.snoozed_until) return false;
    return new Date(habit.snoozed_until) > new Date();
  }

  // ——— Prebuilt Habit Functions ——— //
  async function fetchPrebuiltHabits() {
    if (!user) return [];
    const { data, error } = await supabase
      .from('prebuilt_habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setPrebuiltHabits(data || []);
    return data || [];
  }

  async function createPrebuiltHabit(habit: Omit<PrebuiltHabit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    if (!user) throw new Error('You must be logged in to create a prebuilt habit.');
    const { data, error } = await supabase.from('prebuilt_habits').insert({ ...habit, user_id: user.id }).select().single();
    if (error) throw error;
    setPrebuiltHabits([data, ...prebuiltHabits]);
    return data;
  }

  async function updatePrebuiltHabit(id: string, updates: Partial<PrebuiltHabit>) {
    const { error } = await supabase.from('prebuilt_habits').update(updates).eq('id', id);
    if (error) throw error;
    setPrebuiltHabits(prebuiltHabits.map(h => h.id === id ? { ...h, ...updates } : h));
  }

  async function deletePrebuiltHabit(id: string) {
    const { error } = await supabase.from('prebuilt_habits').delete().eq('id', id);
    if (error) throw error;
    setPrebuiltHabits(prebuiltHabits.filter(h => h.id !== id));
  }

  async function seedDefaultPrebuiltHabits() {
    if (!user) return;
    const { data: existing, error: checkError } = await supabase
      .from('prebuilt_habits')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_default', true);
    if (checkError) throw checkError;
    if (existing && existing.length > 0) return;

    const defaults = [
      { name: 'Drink Water', description: 'Stay hydrated', color: '#3b82f6', icon: '💧', frequency: 'daily' as const, target_days: 7, category: 'Health', is_default: true },
      { name: 'Exercise', description: '30 minutes of physical activity', color: '#ef4444', icon: '💪', frequency: 'daily' as const, target_days: 5, category: 'Fitness', is_default: true },
      { name: 'Read Books', description: 'Read for 30 minutes daily', color: '#10b981', icon: '📚', frequency: 'daily' as const, target_days: 7, category: 'Learning', is_default: true },
      { name: 'Meditate', description: 'Practice mindfulness for 10 minutes', color: '#8b5cf6', icon: '🧘', frequency: 'daily' as const, target_days: 7, category: 'Wellness', is_default: true },
      { name: 'Journal', description: 'Write down your thoughts and reflections', color: '#f59e0b', icon: '📝', frequency: 'daily' as const, target_days: 5, category: 'Personal', is_default: true },
      { name: 'Walk', description: 'Take a 20-minute walk outdoors', color: '#06b6d4', icon: '🚶', frequency: 'daily' as const, target_days: 6, category: 'Fitness', is_default: true },
      { name: 'Learn Language', description: 'Practice a new language for 15 minutes', color: '#ec4899', icon: '🌍', frequency: 'daily' as const, target_days: 5, category: 'Learning', is_default: true },
      { name: 'Healthy Breakfast', description: 'Eat a nutritious breakfast', color: '#84cc16', icon: '🥑', frequency: 'daily' as const, target_days: 7, category: 'Nutrition', is_default: true },
    ];

    const { data, error } = await supabase.from('prebuilt_habits').insert(defaults.map(h => ({ ...h, user_id: user.id }))).select();
    if (error) throw error;
    setPrebuiltHabits([...data, ...prebuiltHabits]);
  }

  // ——— Challenge Functions ——— //
  async function fetchPrebuiltChallenges() {
    const { data, error } = await supabase
      .from('prebuilt_challenges')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    setPrebuiltChallenges(data || []);
    return data || [];
  }

  async function fetchChallenges() {
    if (!user) return [];
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setChallenges(data || []);
    return data || [];
  }

  async function createChallenge(challenge: Omit<Challenge, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    if (!user) throw new Error('You must be logged in to create a challenge.');

    // If creating from prebuilt challenge, ensure the prebuilt habit exists and add it to linked habits
    if (challenge.prebuilt_challenge_id) {
      const prebuiltChallenge = prebuiltChallenges.find(pc => pc.id === challenge.prebuilt_challenge_id);
      if (prebuiltChallenge && prebuiltChallenge.template_id) {
        // Fetch the template habit
        const { data: template, error: templateError } = await supabase
          .from('prebuilt_habits')
          .select('*')
          .eq('template_id', prebuiltChallenge.template_id)
          .single();
        if (templateError) throw templateError;
        if (template) {
          // Check if user already has this prebuilt habit
          let linkedHabit = prebuiltHabits.find(ph => ph.template_id === template.template_id && ph.user_id === user.id);
          if (!linkedHabit) {
            // Add the template to user's prebuilt habits
            const { data: newPrebuiltHabit, error: insertError } = await supabase
              .from('prebuilt_habits')
              .insert({
                ...template,
                user_id: user.id,
                is_template: false, // User's copy, not template
                template_id: null, // Clear template_id for user's copy
              })
              .select()
              .single();
            if (insertError) throw insertError;
            setPrebuiltHabits([newPrebuiltHabit, ...prebuiltHabits]);
            linkedHabit = newPrebuiltHabit;
          }
          // Add the prebuilt habit to the linked habits if not already included
          if (linkedHabit && !challenge.linked_habit_id.includes(linkedHabit.id)) {
            challenge.linked_habit_id = [...challenge.linked_habit_id, linkedHabit.id];
          }
        }
      }
    }

    const { data, error } = await supabase
      .from('challenges')
      .insert({ ...challenge, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    setChallenges([data, ...challenges]);
    return data;
  }

  async function updateChallenge(id: string, updates: Partial<Challenge>) {
    const { error } = await supabase.from('challenges').update(updates).eq('id', id);
    if (error) throw error;
    setChallenges(challenges.map(c => c.id === id ? { ...c, ...updates } : c));
  }

  async function deleteChallenge(id: string) {
    const { error } = await supabase.from('challenges').delete().eq('id', id);
    if (error) throw error;
    setChallenges(challenges.filter(c => c.id !== id));
  }

  function getChallengeProgress(challengeId: string): { completed: number; total: number; percentage: number } {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return { completed: 0, total: 0, percentage: 0 };

    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);
    const linkedHabits = habits.filter(h => challenge.linked_habit_id.includes(h.id));
    if (linkedHabits.length === 0) return { completed: 0, total: 0, percentage: 0 };

    let completed = 0;
    if (challenge.goal_type === 'total_count') {
      // For total_count, count all completion records within the date range
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      completed = completions.filter(c =>
        linkedHabits.some(h => h.id === c.habit_id) &&
        c.completed_date >= startDateStr &&
        c.completed_date <= endDateStr
      ).length;
    } else {
      // For daily_completion, count the number of days completed
      for (const habit of linkedHabits) {
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          if (isCompleted(habit.id, dateStr)) {
            completed++;
          }
        }
      }
    }

    const percentage = challenge.goal_value > 0 ? Math.round((completed / challenge.goal_value) * 100) : 0;
    return { completed, total: challenge.goal_value, percentage };
  }

  async function updateChallengeStatus(challengeId: string): Promise<void> {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.status !== 'active') return;

    const endDate = new Date(challenge.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const progress = getChallengeProgress(challengeId);
    let newStatus: 'active' | 'completed' | 'failed' = 'active';

    if (progress.completed >= progress.total) {
      newStatus = 'completed';
    } else if (endDate < today) {
      newStatus = 'failed';
    }

    if (newStatus !== challenge.status) {
      await updateChallenge(challengeId, { status: newStatus });
      // Check for badges after challenge status update
      await checkAndAwardBadges();
    }
    return;
  }

  const value: HabitsContextType = {
    habits,
    prebuiltHabits,
    prebuiltChallenges,
    challenges,
    completions,
    history,
    loading,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    isCompleted,
    getStreak,
    snoozeHabit,
    unsnoozeHabit,
    isHabitSnoozed,
    refreshHabits: loadHabits,
    refreshCompletions: loadCompletions,
    loadHistory,
    fetchPrebuiltHabits,
    createPrebuiltHabit,
    updatePrebuiltHabit,
    deletePrebuiltHabit,
    seedDefaultPrebuiltHabits,
    fetchPrebuiltChallenges,
    fetchChallenges,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    getChallengeProgress,
    updateChallengeStatus,
    // Badge functions
    predefinedBadges,
    userBadges,
    fetchPredefinedBadges,
    fetchUserBadges,
    checkAndAwardBadges,
    awardBadge,
    getUserStats,
  };

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}
