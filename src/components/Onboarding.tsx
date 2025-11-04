import { useState, useEffect, useRef } from 'react';
import { Sparkles, Flame, Target, X } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { useAuth } from '../contexts/AuthContext';
import { HabitForm } from './HabitForm';

export function SuggestedHabits({ shouldSeedDefaults = false, onHabitAdded, onSavingChange }: { shouldSeedDefaults?: boolean; onHabitAdded?: () => void; onSavingChange?: (saving: boolean) => void }) {
  const { createHabit, habits, fetchPrebuiltHabits, seedDefaultPrebuiltHabits, prebuiltHabits, refreshHabits } = useHabits();
  const [prebuiltHabitsLoaded, setPrebuiltHabitsLoaded] = useState(false);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [initialDraft, setInitialDraft] = useState<{ name: string; description: string; color: string; icon: string; frequency: 'daily' | 'weekly' | 'custom'; target_days: number; } | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const didInitRef = useRef(false);

  // Load prebuilt habits on component mount
  useEffect(() => {
    if (didInitRef.current) return; // guard against StrictMode double-invoke in dev
    didInitRef.current = true;
    const loadPrebuiltHabits = async () => {
      try {
        let habits = await fetchPrebuiltHabits();
        if (habits.length === 0) {
          // Seed default habits if none exist
          await seedDefaultPrebuiltHabits();
          habits = await fetchPrebuiltHabits();
        }
        setPrebuiltHabitsLoaded(true);
      } catch (error) {
        console.error('Error loading prebuilt habits:', error);
        setPrebuiltHabitsLoaded(true); // Still set to true to show UI
      }
    };

    loadPrebuiltHabits();
  }, [fetchPrebuiltHabits, seedDefaultPrebuiltHabits]);

  // Notify parent component of saving state changes
  useEffect(() => {
    onSavingChange?.(saving);
  }, [saving, onSavingChange]);

  // Filter out habits that user already has
  const existingHabitNames = new Set(habits.map(h => h.name.toLowerCase()));
  // Deduplicate by name to avoid showing duplicates if data was inserted twice
  const dedupedByName = Array.from(
    prebuiltHabits.reduce<Map<string, typeof prebuiltHabits[number]>>((map, h) => {
      const key = h.name.trim().toLowerCase();
      if (!map.has(key)) map.set(key, h);
      return map;
    }, new Map()).values()
  );

  const availableHabits = dedupedByName.filter(habit => !existingHabitNames.has(habit.name.toLowerCase()));

  const openCustomize = async (habitIndex: number) => {
    const h = availableHabits[habitIndex];
    const freq = h.frequency === 'weekly' ? 'custom' : (h.frequency as 'daily' | 'custom');
    setInitialDraft({ name: h.name, description: h.description, color: h.color, icon: h.icon, frequency: freq, target_days: h.target_days });
    setShowHabitForm(true);
  };

  const handleQuickAdd = async (habitIndex: number) => {
    const h = availableHabits[habitIndex];
    const freq = h.frequency === 'weekly' ? 'custom' : (h.frequency as 'daily' | 'custom');
    setSaving(true);
    try {
      await createHabit({
        name: h.name,
        description: h.description,
        color: h.color,
        icon: h.icon,
        frequency: h.frequency === 'weekly' ? 'custom' : h.frequency as 'daily' | 'custom',
        active_days: h.frequency === 'weekly' ? [1, 2, 3, 4, 5] : [],
        target_days: h.target_days,
        category: [h.category],
        is_active: true,
        reminder_time: null,
        reminders_enabled: false,
        browser_notifications: false,
        email_notifications: false,
        snoozed_until: null,
        snooze_duration: null,
      });
      // Refresh habits to ensure the state is updated
      await refreshHabits();
      // Call the callback to close the onboarding modal after adding a habit
      onHabitAdded?.();
    } finally {
      setSaving(false);
    }
  };

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const handleAddSelected = async () => {
    if (selectedIndices.size === 0) return;

    setSaving(true);
    try {
      for (const index of Array.from(selectedIndices)) {
        const h = availableHabits[index];
        try {
          await createHabit({
            name: h.name,
            description: h.description,
            color: h.color,
            icon: h.icon,
            frequency: h.frequency === 'weekly' ? 'custom' : h.frequency as 'daily' | 'custom',
            active_days: h.frequency === 'weekly' ? [1, 2, 3, 4, 5] : [],
            target_days: h.target_days,
            category: [h.category],
            is_active: true,
            reminder_time: null,
            reminders_enabled: false,
            browser_notifications: false,
            email_notifications: false,
            snoozed_until: null,
            snooze_duration: null,
          });
        } catch (error) {
          console.error(`Failed to add habit "${h.name}":`, error);
        }
      }
      // Refresh habits to update the UI immediately
      await refreshHabits();
      setSelectedIndices(new Set()); // Clear selection after adding
      onHabitAdded?.(); // Call the callback to close the onboarding modal after adding a habit
    } finally {
      setSaving(false);
    }
  };
  // no-op legacy handler removed; customization now uses HabitForm

  if (!prebuiltHabitsLoaded) {
    return (
      <div className="mt-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading Suggested Habits...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Suggested Habits
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Get inspired by these popular habits. Use Customize to review fields before adding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {availableHabits.map((habit, index) => {
          const isSelected = selectedIndices.has(index);
          return (
            <div
              key={habit.id || index}
              onClick={() => toggleSelection(index)}
              className={`text-left relative p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: habit.color + '20' }}
                >
                  {habit.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {habit.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {habit.description}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Flame className="w-3 h-3" />
                    <span>Example: 12 day streak</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Target className="w-3 h-3" />
                    <span>85%</span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: '85%',
                      backgroundColor: habit.color
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-500">
                    {habit.category}
                  </span>
                  <span className="text-gray-500 dark:text-gray-500">
                    {habit.frequency === 'daily' ? 'Daily' : 'Weekly'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCustomize(index);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Customize
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickAdd(index);
                  }}
                  disabled={saving}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedIndices.size > 0 && (
        <div className="flex justify-center mb-8">
          <button
            onClick={handleAddSelected}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>Add Selected ({selectedIndices.size})</span>
          </button>
        </div>
      )}

      {showHabitForm && initialDraft && (
        <HabitForm
          habitId={null}
          onClose={() => setShowHabitForm(false)}
          initial={{
            name: initialDraft.name,
            description: initialDraft.description,
            color: initialDraft.color,
            icon: initialDraft.icon,
            frequency: initialDraft.frequency as 'daily' | 'custom',
            target_days: initialDraft.target_days,
            reminders_enabled: false,
            reminder_time: null,
            browser_notifications: false,
            email_notifications: false,
          }}
        />
      )}
    </div>
  );
}

// Onboarding component for new users with no habits - shows as a modal
export function Onboarding({ onOpenPrebuiltManager }: { onOpenPrebuiltManager?: () => void }) {
  const { habits, loading } = useHabits();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Only show onboarding modal for users with no habits and when not loading
  // Don't close during saving to allow multiple habits to be added
  if (loading || (habits.length > 0 && !saving) || dismissed) {
    return null;
  }

  // Show for new users with no habits
  // Temporarily disabled localStorage check for testing
  // const key = `onboarding_shown_${user?.id ?? 'anon'}`;
  // const alreadyShown = typeof window !== 'undefined' && localStorage.getItem(key) === '1';
  // if (alreadyShown) return null;

  // Mark as shown so it won't appear next time
  const [isManuallyClosed, setIsManuallyClosed] = useState(false);
  const key = `onboarding_shown_${user?.id ?? 'anon'}`;

  // Initialize 'alreadyShown' state from localStorage
  const [alreadyShown, setAlreadyShown] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(key) === '1';
    } catch {
      return false;
    }
  });

  // Helper function to mark the modal as shown in localStorage and state
  const markAsShown = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, '1');
        setAlreadyShown(true);
      } catch (e) {
        console.warn('Failed to save onboarding state:', e);
      }
    }
  };

  // Handler for the new close button
  const handleClose = () => {
    markAsShown();
    setIsManuallyClosed(true);
  };

  // Determine if the modal should be shown based on all conditions
  const shouldShow =
    !loading &&
    habits.length === 0 &&
    !saving &&
    !alreadyShown &&
    !isManuallyClosed;

  if (!shouldShow) {
    return null;
  }

return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        title="Close onboarding"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Habit Tracker!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Let's get you started with your first habit. Choose one that interests you.
          </p>
        </div>

        <SuggestedHabits
          shouldSeedDefaults={true}
          onHabitAdded={() => {
            markAsShown();
          }}
          onSavingChange={setSaving}
        />

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You can always add more habits later from your dashboard
          </p>
        </div>
      </div>
    </div>
  </div>
);

}