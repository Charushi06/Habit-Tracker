import { useState, useEffect } from 'react';
import { useHabits } from '../hooks/useHabits';
import { Plus, Edit, Trash2, X, Sparkles } from 'lucide-react';
import { PrebuiltHabitForm } from './PrebuiltHabitForm';

type PrebuiltHabit = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  frequency: 'daily' | 'custom';
  target_days: number;
  category: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export function PrebuiltHabitsManager({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    prebuiltHabits,
    fetchPrebuiltHabits,
    deletePrebuiltHabit
  } = useHabits();

  const [editingHabit, setEditingHabit] = useState<PrebuiltHabit | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPrebuiltHabits();
    }
  }, [isOpen, fetchPrebuiltHabits]);

  const resetForm = () => {
    setEditingHabit(null);
    setShowForm(false);
  };

  const handleEdit = (habit: PrebuiltHabit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prebuilt habit?')) return;

    try {
      await deletePrebuiltHabit(id);
      await fetchPrebuiltHabits();
    } catch (error) {
      console.error('Error deleting prebuilt habit:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Manage Prebuilt Habits
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customize the habits shown during onboarding
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {prebuiltHabits.length} prebuilt habit{prebuiltHabits.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New</span>
            </button>
          </div>

          {showForm && (
            <PrebuiltHabitForm
              habitId={editingHabit?.id ?? null}
              onClose={() => {
                resetForm();
                fetchPrebuiltHabits();
              }}
            />
          )}

          <div className="space-y-3">
            {prebuiltHabits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: habit.color + '20' }}
                  >
                    {habit.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{habit.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{habit.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mt-1">
                      <span>{habit.category}</span>
                      <span>•</span>
                      <span>{habit.frequency}</span>
                      <span>•</span>
                      <span>{habit.target_days} days</span>
                      {habit.is_default && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 dark:text-blue-400">Default</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(habit)}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {!habit.is_default && (
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {prebuiltHabits.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No prebuilt habits yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Add some habits that will be suggested during onboarding
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Your First Prebuilt Habit</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
