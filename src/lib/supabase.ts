import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-public-api-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Runtime diagnostics: warn in browser console when env variables are not configured.
if (typeof window !== 'undefined') {
  try {
    const usingPlaceholderUrl = supabaseUrl.includes('your-project-id') || supabaseUrl === '';
    const usingPlaceholderKey = supabaseAnonKey.includes('your-anon-public-api-key') || supabaseAnonKey === '';

    if (usingPlaceholderUrl || usingPlaceholderKey) {
      // Keep message concise and actionable without leaking keys
      // eslint-disable-next-line no-console
      console.warn(
        'Supabase env not configured: create a .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see README).'
      );
    } else {
      // eslint-disable-next-line no-console
      console.log('Supabase URL:', supabaseUrl);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Supabase runtime diagnostic check failed', e);
  }
}

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  theme: 'light' | 'dark';
  timezone?: string; // IANA tz like "America/Los_Angeles"
  timezone_manual?: boolean; // true if user manually overrides browser tz
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  frequency: 'daily' | 'custom'; // Updated
  active_days: number[]; // Added
  // target_days: number; // This is no longer used
  is_active: boolean;
  reminder_time?: string | null; // HH:MM local time string
  reminders_enabled?: boolean;
  browser_notifications?: boolean;
  email_notifications?: boolean;
  snoozed_until?: string | null;
  snooze_duration?: number | null;
  next_reminder_at_utc?: string | null; // ISO string for next reminder run in UTC
  created_at: string;
  updated_at: string;
  category: string[];
  category_id?: string | null;
};

export type HabitCompletion = {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  notes: string;
  created_at: string;
};
