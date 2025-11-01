import { useState, useEffect, useRef } from 'react';
import { X, Save } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
];

const ICONS = ['🎯', '📚', '💪', '🧘', '🏃', '💻', '🎨', '🎵', '✍️', '🌱'];

const CATEGORIES = [
  "General", "Health", "Fitness", "Learning", "Productivity",
  "Wellness", "Personal", "Nutrition", "Professional", "Creative"
];

// New constants for custom days
const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5]; // Default for custom

type Props = {
  habitId: string | null;
  onClose: () => void;
  initial?: Partial<{
    name: string;
    description: string;
    color: string;
    icon: string;
    frequency: 'daily' | 'weekly' | 'custom';
    target_days: number;
    reminders_enabled: boolean;
    reminder_time: string | null;
    browser_notifications: boolean;
    email_notifications: boolean;
  }>;
};

export function HabitForm({ habitId, onClose, initial }: Props) {
  const { habits, createHabit, updateHabit } = useHabits();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);

  // Updated state for frequency
  const [frequency, setFrequency] = useState<'daily' | 'custom'>('daily');
  const [activeDays, setActiveDays] = useState<number[]>(ALL_DAYS); // New state


  const [category, setCategory] = useState<string[]>([CATEGORIES[0]]);
  const [targetDays, setTargetDays] = useState(7);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (habitId) {
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        setName(habit.name);
        setDescription(habit.description);
        setColor(habit.color);
        setIcon(habit.icon);
        setCategory(habit.category && habit.category.length > 0 ? habit.category : [CATEGORIES[0]]);
        

        // Handle old 'weekly' frequency as 'custom'
        if (habit.frequency === 'weekly') {
          setFrequency('custom');
          setActiveDays(WEEKDAYS); // Default old 'weekly' habits to weekdays
        } else {
          setFrequency(habit.frequency as 'daily' | 'custom');
          setActiveDays(habit.active_days || ALL_DAYS);
        }
        setTargetDays(habit.target_days);
        setRemindersEnabled(habit.reminders_enabled);
        setReminderTime(habit.reminder_time || '09:00');
        setBrowserNotifications(habit.browser_notifications ?? true);
        setEmailNotifications(habit.email_notifications ?? false);
      }
    } else if (initial) {
      if (initial.name) setName(initial.name);
      if (initial.description !== undefined) setDescription(initial.description);
      if (initial.color) setColor(initial.color);
      if (initial.icon) setIcon(initial.icon);
      if (initial.frequency) setFrequency(initial.frequency === 'weekly' ? 'custom' : initial.frequency as 'daily' | 'custom');
      if (typeof initial.target_days === 'number') setTargetDays(initial.target_days);
      if (typeof initial.reminders_enabled === 'boolean') setRemindersEnabled(initial.reminders_enabled);
      if (typeof initial.browser_notifications === 'boolean') setBrowserNotifications(initial.browser_notifications);
      if (typeof initial.email_notifications === 'boolean') setEmailNotifications(initial.email_notifications);
      if (initial.reminder_time) setReminderTime(initial.reminder_time);
      setCategory([CATEGORIES[0]]);
    } else {
      // Set defaults for new habit
      setFrequency('daily');
      setActiveDays(ALL_DAYS);
      setCategory([CATEGORIES[0]]);
    }
    setError(''); // Clear any previous errors
  }, [habitId, habits, initial]);

  // New function to toggle weekdays
  function toggleDay(dayIndex: number) {
    if (frequency !== 'custom') return; // Should not be possible

    let newActiveDays;
    if (activeDays.includes(dayIndex)) {
      newActiveDays = activeDays.filter(d => d !== dayIndex);
    } else {
      newActiveDays = [...activeDays, dayIndex].sort();
    }

    // Don't allow unselecting all days
    if (newActiveDays.length > 0) {
      setActiveDays(newActiveDays);
    }
  }

  function toggleCategory(cat: string) {
    if (cat === 'General') {
      setCategory(['General']);
      return;
    }

    let newCategories = [...category];
    if (newCategories.includes(cat)) {
      // Remove it
      newCategories = newCategories.filter(c => c !== cat);
    } else {
      // Add it
      newCategories.push(cat);
      // And remove 'General'
      newCategories = newCategories.filter(c => c !== 'General');
    }

    if (newCategories.length === 0) {
      setCategory(['General']);
    } else {
      setCategory(newCategories);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setSaving(true);
  setError('');

  const finalActiveDays = frequency === 'daily' ? ALL_DAYS : activeDays;
  const finalCategory = category.length > 0 ? category : [CATEGORIES[0]];

 try {
  if (habitId) {
    await updateHabit(habitId, {
      name,
      description,
      color,
      icon,
      frequency,
      active_days: finalActiveDays,
      category: finalCategory,
      target_days: targetDays,
      reminder_time: remindersEnabled ? reminderTime : null,
      reminders_enabled: remindersEnabled,
      browser_notifications: browserNotifications,
      email_notifications: emailNotifications,
    });
  } else {
    await createHabit({
      name,
      description,
      color,
      icon,
      frequency,
      active_days: finalActiveDays,
      category: finalCategory,
      target_days: targetDays,
      is_active: true,
      reminder_time: remindersEnabled ? reminderTime : null,
      reminders_enabled: remindersEnabled,
      browser_notifications: browserNotifications,
      email_notifications: emailNotifications,
      snoozed_until: null,
      snooze_duration: null,
    });
  }

  onClose();
} catch (error: unknown) {
  const errorMessage = error instanceof Error
    ? error.message
    : 'An error occurred while saving the habit.';
  setError(errorMessage);

  setTimeout(() => {
    errorRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, 100);
} finally {
  setSaving(false);
}

}


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {habitId ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close habit form"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              ref={errorRef}
              className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Habit Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Morning Exercise"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about your habit..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Choose Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`p-3 text-2xl rounded-lg border-2 transition-all ${icon === i
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Choose Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-full h-10 rounded-lg border-2 transition-all ${color === c
                    ? 'border-gray-900 dark:border-white scale-110'
                    : 'border-transparent hover:scale-105'
                    }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category (Select one or more)
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    category.includes(cat)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* --- MODIFIED FREQUENCY SECTION --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frequency
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFrequency('daily');
                  setActiveDays(ALL_DAYS);
                }}
                className={`p-3 rounded-lg border-2 transition-all ${frequency === 'daily'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => {
                  setFrequency('custom');
                  // Default to weekdays if switching from daily
                  if (frequency === 'daily') {
                    setActiveDays(WEEKDAYS);
                  }
                }}
                className={`p-3 rounded-lg border-2 transition-all ${frequency === 'custom'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* --- NEW WEEKDAY PICKER --- */}
          {frequency === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Active Days
              </label>
              <div className="grid grid-cols-7 gap-2">
                {WEEK_DAYS.map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`p-3 font-medium rounded-lg border-2 transition-all text-center ${
                      activeDays.includes(index)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* --- REMOVED 'weekly' range slider --- */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={remindersEnabled}
                onChange={(e) => setRemindersEnabled(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Reminders
              </span>
            </label>
          </div>

          {remindersEnabled && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Reminder Settings
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="reminder-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    When should we remind you?
                  </label>
                  <input
                    id="reminder-time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-mono"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Choose your preferred reminder time. We'll send both browser notifications and email reminders.
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-sm">🔔</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Browser Notifications
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Get instant reminders in your browser
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={browserNotifications}
                        onChange={(e) => setBrowserNotifications(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        aria-label="Enable browser notifications"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-sm">📧</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Email Reminders
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Receive email notifications as backup
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        aria-label="Enable email notifications"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Habit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
