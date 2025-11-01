import { useState, useEffect, useRef } from 'react';
import { X, Save } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';

const COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#84cc16"
];

const ICONS = ['💧', '🏃‍♂️', '📚', '🧘‍♀️', '😴', '🍎', '📖', '🎵', '🚶‍♂️', '🧘'];

const CATEGORIES = [
  "General", "Health", "Fitness", "Learning", "Productivity",
  "Wellness", "Personal", "Nutrition", "Professional", "Creative"
];

type Props = {
  habitId: string | null;
  onClose: () => void;
};

export function PrebuiltHabitForm({ habitId, onClose }: Props) {
  const { prebuiltHabits, createPrebuiltHabit, updatePrebuiltHabit } = useHabits();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const [frequency, setFrequency] = useState<"daily" | "custom">("daily");
  const [targetDays, setTargetDays] = useState(7);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (habitId) {
      const habit = prebuiltHabits.find(h => h.id === habitId);
      if (habit) {
        setName(habit.name);
        setDescription(habit.description);
        setColor(habit.color);
        setIcon(habit.icon);
        setFrequency(habit.frequency);
        setTargetDays(habit.target_days);
        setCategory(habit.category);
      }
    }
    setError(""); // Clear any previous errors
  }, [habitId, prebuiltHabits]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(""); // Clear previous errors

    try {
      if (habitId) {
        await updatePrebuiltHabit(habitId, {
          name,
          description,
          color,
          icon,
          frequency,
          target_days: targetDays,
          category,
        });
      } else {
        await createPrebuiltHabit({
          name,
          description,
          color,
          icon,
          frequency,
          target_days: targetDays,
          category,
          is_default: false,
        });
      }
      onClose();
    } catch (err: unknown) {
      console.error("Error saving prebuilt habit:", err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      errorRef.current?.scrollIntoView({ behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {habitId ? "Edit Prebuilt Habit" : "Add Prebuilt Habit"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div ref={errorRef} className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Drink Water"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Brief description of the habit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === c ? "border-gray-900 dark:border-white" : "border-gray-300 dark:border-gray-600"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`p-2 text-2xl rounded-lg border-2 ${
                    icon === i
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as "daily" | "custom")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Days per Week
            </label>
            <input
              type="number"
              value={targetDays}
              onChange={(e) => setTargetDays(Math.max(1, Math.min(7, parseInt(e.target.value) || 1)))}
              min={1}
              max={7}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

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
              disabled={saving || !name.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? "Saving..." : "Save Habit"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
