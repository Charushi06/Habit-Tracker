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
  created_at: string;
  updated_at: string;
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
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [history, setHistory] = useState<HabitHistory[]>([]);
  const [loading, setLoading] = useState(true);

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
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .gte('completed_date', thirtyDaysAgo.toISOString().split('T')[0]);
      if (error) throw error;
      setCompletions(data || []);
    } catch (error) {
      console.error('Error loading completions:', error);
    }
  }, []);

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
    } else {
      setHabits([]);
      setCompletions([]);
      setHistory([]);
      setPrebuiltHabits([]);
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
        target_days: 7,
      })
      .select()
      .single();
    if (error) throw error;
    setHabits([data, ...habits]);
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
    const { error } = await supabase.from('habits').update({ is_active: false }).eq('id', id);
    if (error) throw error;
    setHabits(habits.filter(h => h.id !== id));
    cancelHabitReminder(id);
  }

  async function toggleCompletion(habitId: string, date: string) {
    if (!user) return;
    const existing = completions.find(c => c.habit_id === habitId && c.completed_date === date);
    if (existing) {
      const { error } = await supabase.from('habit_completions').delete().eq('id', existing.id);
      if (error) throw error;
      setCompletions(completions.filter(c => c.id !== existing.id));
    } else {
      const { data, error } = await supabase
        .from('habit_completions')
        .insert({ habit_id: habitId, user_id: user.id, completed_date: date })
        .select()
        .single();
      if (error) throw error;
      setCompletions([...completions, data]);
    }
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

  const value: HabitsContextType = {
    habits,
    prebuiltHabits,
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
  };

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}
