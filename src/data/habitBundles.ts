/**
 * Pre-built habit bundles for quick setup
 * Issue #31: Add Pre-built habit bundles for quick setup
 */

export type BundleHabit = {
  name: string;
  emoji: string;
  color: string;
  frequency: 'daily' | 'custom';
  active_days?: number[]; // 0 = Sunday, 1 = Monday, etc.
  description?: string;
};

export type HabitBundle = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  habits: BundleHabit[];
};

export const habitBundles: HabitBundle[] = [
  {
    id: 'morning-routine',
    name: 'Morning Routine',
    description: 'Start your day with energy and focus. This bundle includes habits to wake up refreshed, stay hydrated, and set positive intentions.',
    icon: '🌅',
    category: 'Wellness',
    habits: [
      {
        name: 'Drink Morning Water',
        emoji: '💧',
        color: '#3b82f6',
        frequency: 'daily',
        description: 'Start your day with a glass of water to rehydrate',
      },
      {
        name: 'Morning Stretching',
        emoji: '🧘',
        color: '#8b5cf6',
        frequency: 'daily',
        description: '10 minutes of gentle stretching to wake up your body',
      },
      {
        name: 'Healthy Breakfast',
        emoji: '🍳',
        color: '#f59e0b',
        frequency: 'daily',
        description: 'Fuel your day with a nutritious breakfast',
      },
      {
        name: 'Set Daily Intention',
        emoji: '📝',
        color: '#10b981',
        frequency: 'daily',
        description: 'Write down one goal or intention for the day',
      },
    ],
  },
  {
    id: 'fitness-goals',
    name: 'Fitness Goals',
    description: 'Build a consistent fitness routine with cardio, strength, and recovery habits. Perfect for beginners starting their fitness journey.',
    icon: '💪',
    category: 'Fitness',
    habits: [
      {
        name: 'Morning Jog/Walk',
        emoji: '🏃',
        color: '#ef4444',
        frequency: 'custom',
        active_days: [1, 3, 5], // Mon, Wed, Fri
        description: '30 minutes of cardio to boost energy',
      },
      {
        name: 'Strength Training',
        emoji: '🏋️',
        color: '#f97316',
        frequency: 'custom',
        active_days: [2, 4, 6], // Tue, Thu, Sat
        description: 'Build muscle with bodyweight or weight exercises',
      },
      {
        name: 'Track Steps',
        emoji: '👟',
        color: '#14b8a6',
        frequency: 'daily',
        description: 'Aim for 8,000-10,000 steps per day',
      },
      {
        name: 'Post-Workout Stretch',
        emoji: '🤸',
        color: '#8b5cf6',
        frequency: 'custom',
        active_days: [1, 2, 3, 4, 5, 6], // Mon-Sat
        description: 'Cool down and prevent injury with stretching',
      },
    ],
  },
  {
    id: 'productivity-boost',
    name: 'Productivity Boost',
    description: 'Optimize your workday with habits for focus, organization, and continuous improvement. Ideal for professionals and students.',
    icon: '🚀',
    category: 'Productivity',
    habits: [
      {
        name: 'Plan Your Day',
        emoji: '📋',
        color: '#3b82f6',
        frequency: 'daily',
        description: 'Review and prioritize your top 3 tasks',
      },
      {
        name: 'Deep Focus Session',
        emoji: '🎯',
        color: '#f59e0b',
        frequency: 'custom',
        active_days: [1, 2, 3, 4, 5], // Weekdays
        description: '90 minutes of uninterrupted deep work',
      },
      {
        name: 'Take Breaks',
        emoji: '☕',
        color: '#10b981',
        frequency: 'custom',
        active_days: [1, 2, 3, 4, 5], // Weekdays
        description: 'Step away from work every 90 minutes',
      },
      {
        name: 'Review & Reflect',
        emoji: '🌙',
        color: '#6366f1',
        frequency: 'custom',
        active_days: [5], // Friday
        description: 'Weekly review: accomplishments and lessons learned',
      },
      {
        name: 'Read 30 Minutes',
        emoji: '📚',
        color: '#ec4899',
        frequency: 'custom',
        active_days: [1, 2, 3, 4, 5, 6, 0], // Daily
        description: 'Expand your knowledge with daily reading',
      },
    ],
  },
  {
    id: 'mindfulness-wellness',
    name: 'Mindfulness & Wellness',
    description: 'Cultivate inner peace and emotional balance through meditation, gratitude, and self-care practices.',
    icon: '🧘‍♀️',
    category: 'Wellness',
    habits: [
      {
        name: 'Morning Meditation',
        emoji: '🧘',
        color: '#8b5cf6',
        frequency: 'daily',
        description: 'Start with 10 minutes of mindfulness meditation',
      },
      {
        name: 'Gratitude Journal',
        emoji: '🙏',
        color: '#f59e0b',
        frequency: 'daily',
        description: 'Write 3 things you are grateful for',
      },
      {
        name: 'Digital Detox Hour',
        emoji: '📵',
        color: '#64748b',
        frequency: 'daily',
        description: 'One hour without screens before bed',
      },
      {
        name: 'Evening Reflection',
        emoji: '🌙',
        color: '#6366f1',
        frequency: 'daily',
        description: 'Reflect on your day and let go of stress',
      },
    ],
  },
];

export function getBundleById(id: string): HabitBundle | undefined {
  return habitBundles.find((bundle) => bundle.id === id);
}

export function getAllBundles(): HabitBundle[] {
  return habitBundles;
}
