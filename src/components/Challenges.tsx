import { useState, useEffect } from 'react';
import { Plus, Target, Calendar, Trophy, Clock, CheckCircle2, Circle, Trash2, FileText, Hash, Play, Flag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useHabits } from '../hooks/useHabits';
import { supabase } from '../lib/supabase';
import { HabitForm } from './HabitForm';

interface Challenge {
  id: string;
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
  prebuilt_challenge_id?: string;
}

interface PrebuiltChallenge {
  id: string;
  name: string;
  description: string;
  linked_habit_id?: string;
  duration_days: number;
  goal_type: 'daily_completion' | 'total_count';
  goal_value: number;
  is_default: boolean;
}

export function Challenges() {
  const { user } = useAuth();
  const { habits, isCompleted, createHabit, refreshHabits, updateChallengeStatus } = useHabits();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [prebuiltChallenges, setPrebuiltChallenges] = useState<PrebuiltChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPrebuilt, setSelectedPrebuilt] = useState<PrebuiltChallenge | null>(null);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges();
    fetchPrebuiltChallenges();
  }, []);

  useEffect(() => {
    // Update status for active challenges that have ended
    const updateStatuses = async () => {
      const activeChallenges = challenges.filter(c => c.status === 'active');
      await Promise.all(activeChallenges.map(c => updateChallengeStatus(c.id)));
      // Refresh challenges after updating statuses
      await fetchChallenges();
    };
    if (challenges.length > 0) {
      updateStatuses();
    }
  }, [challenges]);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const fetchPrebuiltChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('prebuilt_challenges')
        .select('*')
        .eq('is_default', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrebuiltChallenges(data || []);
    } catch (error) {
      console.error('Error fetching prebuilt challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChallenge = async (challengeData: Partial<Challenge>) => {
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        ...challengeData,
        user_id: user?.id,
        status: 'active'
      } as any)
      .select()
      .single();

    if (error) throw error;
    setChallenges([data, ...challenges]);
    setShowCreateForm(false);
    setSelectedPrebuilt(null);
  };

  const deleteChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId)
        .eq('user_id', user?.id);

      if (error) throw error;
      setChallenges(challenges.filter(c => c.id !== challengeId));
    } catch (error) {
      console.error('Error deleting challenge:', error);
    }
  };

  const getChallengeProgress = (challenge: Challenge) => {
    const linkedHabits = habits.filter(h => challenge.linked_habit_id.includes(h.id));
    if (linkedHabits.length === 0) return 0;

    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);

    let completed = 0;
    for (const habit of linkedHabits) {
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (isCompleted(habit.id, dateStr)) {
          completed++;
        }
      }
    }
    return completed;
  };

  const getDaysRemaining = (challenge: Challenge) => {
    const endDate = new Date(challenge.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Challenges</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Take on challenges to build stronger habits
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create Challenge</span>
        </button>
      </div>

      {/* Active Challenges */}
      {challenges.filter(c => c.status === 'active').length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Active Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.filter(c => c.status === 'active').map((challenge) => {
              const progress = getChallengeProgress(challenge);
              const progressPercent = (progress / challenge.goal_value) * 100;
              const daysRemaining = getDaysRemaining(challenge);

              return (
                <div
                  key={challenge.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {challenge.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {challenge.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Linked Habit: {habits.find(h => h.id === challenge.linked_habit_id[0])?.name || 'Unknown Habit'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteChallenge(challenge.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {progress}/{challenge.goal_value}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{daysRemaining} days left</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{challenge.duration_days} days total</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Challenges */}
      {challenges.filter(c => c.status === 'completed').length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Completed Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.filter(c => c.status === 'completed').map((challenge) => {
              const progress = getChallengeProgress(challenge);
              const progressPercent = (progress / challenge.goal_value) * 100;

              return (
                <div
                  key={challenge.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-green-200 dark:border-green-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {challenge.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {challenge.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Linked Habit: {habits.find(h => h.id === challenge.linked_habit_id[0])?.name || 'Unknown Habit'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteChallenge(challenge.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {progress}/{challenge.goal_value} - Completed!
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{challenge.duration_days} days total</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 dark:text-green-400">Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Failed Challenges */}
      {challenges.filter(c => c.status === 'failed').length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Failed Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.filter(c => c.status === 'failed').map((challenge) => {
              const progress = getChallengeProgress(challenge);
              const progressPercent = (progress / challenge.goal_value) * 100;
              const motivationalMessage = progressPercent >= 60
                ? `You made it ${Math.round(progressPercent)}% — try again!`
                : `You completed ${Math.round(progressPercent)}% — keep going!`;

              return (
                <div
                  key={challenge.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-red-200 dark:border-red-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                        <Circle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {challenge.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {challenge.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Linked Habit: {habits.find(h => h.id === challenge.linked_habit_id[0])?.name || 'Unknown Habit'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteChallenge(challenge.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        {progress}/{challenge.goal_value}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      />
                    </div>

                    <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                      {motivationalMessage}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{challenge.duration_days} days total</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Circle className="w-4 h-4 text-red-600" />
                        <span className="text-red-600 dark:text-red-400">Failed</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Prebuilt Challenges */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Suggested Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prebuiltChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {challenge.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {challenge.duration_days} days • {challenge.goal_value} {challenge.goal_type === 'daily_completion' ? 'completions' : 'total'}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {challenge.description}
              </p>

              <button
                onClick={() => setSelectedPrebuilt(challenge)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Start Challenge
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Challenge Modal */}
      {(showCreateForm || selectedPrebuilt) && (
        <ChallengeForm
          prebuiltChallenge={selectedPrebuilt}
          onSubmit={createChallenge}
          onClose={() => {
            setShowCreateForm(false);
            setSelectedPrebuilt(null);
          }}
          createHabit={createHabit}
          refreshHabits={refreshHabits}
          habits={habits}
        />
      )}

      {/* Habit Form Modal */}
      {showHabitForm && (
        <HabitForm
          habitId={selectedHabitId}
          onClose={() => {
            setShowHabitForm(false);
            setSelectedHabitId(null);
          }}
        />
      )}
    </div>
  );
}

interface ChallengeFormProps {
  prebuiltChallenge?: PrebuiltChallenge | null;
  onSubmit: (data: Partial<Challenge>) => void;
  onClose: () => void;
  createHabit: (habit: any) => Promise<any>;
  refreshHabits: () => Promise<void>;
  habits: any[];
}

function ChallengeForm({ prebuiltChallenge, onSubmit, onClose, createHabit, refreshHabits, habits }: ChallengeFormProps) {
  const [formData, setFormData] = useState({
    name: prebuiltChallenge?.name || '',
    description: prebuiltChallenge?.description || '',
    duration_days: prebuiltChallenge?.duration_days || 7,
    goal_type: prebuiltChallenge?.goal_type || 'daily_completion',
    goal_value: prebuiltChallenge?.goal_value || (prebuiltChallenge?.duration_days || 7),
    start_date: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [habitMode, setHabitMode] = useState<'existing' | 'new'>('new');
  const [selectedExistingHabitId, setSelectedExistingHabitId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (habitMode === 'existing') {
        // Use existing habit
        const startDate = new Date(formData.start_date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + formData.duration_days - 1);

        await onSubmit({
          name: formData.name,
          description: formData.description,
          linked_habit_id: [selectedExistingHabitId],
          duration_days: formData.duration_days,
          goal_type: formData.goal_type,
          goal_value: formData.goal_value,
          start_date: formData.start_date,
          end_date: endDate.toISOString().split('T')[0],
          prebuilt_challenge_id: prebuiltChallenge?.id,
        });

        onClose();
      } else {
        // Create new habit
        setShowHabitForm(true);
      }
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Failed to create challenge. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleHabitCreated = async (habitId: string) => {
    try {
      await refreshHabits();

      const startDate = new Date(formData.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + formData.duration_days - 1);

      await onSubmit({
        name: formData.name,
        description: formData.description,
        linked_habit_id: [habitId],
        duration_days: formData.duration_days,
        goal_type: formData.goal_type,
        goal_value: formData.goal_value,
        start_date: formData.start_date,
        end_date: endDate.toISOString().split('T')[0],
        prebuilt_challenge_id: prebuiltChallenge?.id,
      });

      onClose();
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Failed to create challenge. Please try again.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {prebuiltChallenge ? 'Start Challenge' : 'Create Challenge'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Target className="w-4 h-4" />
                Challenge Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter challenge name..."
                required
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FileText className="w-4 h-4" />
                Challenge Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                rows={3}
                placeholder="Describe your challenge..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Clock className="w-4 h-4" />
                  Duration (days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Flag className="w-4 h-4" />
                Goal Type
              </label>
              <select
                value={formData.goal_type}
                onChange={(e) => setFormData({ ...formData, goal_type: e.target.value as 'daily_completion' | 'total_count' })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              >
                <option value="daily_completion">Daily Completion</option>
                <option value="total_count">Total Count</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Hash className="w-4 h-4" />
                Goal Value
              </label>
              <input
                type="number"
                min="1"
                value={formData.goal_value}
                onChange={(e) => setFormData({ ...formData, goal_value: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
              <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Goal value is the number of times you want to complete that habit
                </p>
              </div>
            </div>

            {/* Habit Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Link to Habit
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="radio"
                    id="new-habit"
                    name="habit-mode"
                    value="new"
                    checked={habitMode === 'new'}
                    onChange={(e) => setHabitMode(e.target.value as 'existing' | 'new')}
                    className="mt-1"
                  />
                  <label htmlFor="new-habit" className="text-sm text-gray-700 dark:text-gray-300">
                    Create a new habit for this challenge
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="radio"
                    id="existing-habit"
                    name="habit-mode"
                    value="existing"
                    checked={habitMode === 'existing'}
                    onChange={(e) => setHabitMode(e.target.value as 'existing' | 'new')}
                    className="mt-1"
                  />
                  <label htmlFor="existing-habit" className="text-sm text-gray-700 dark:text-gray-300">
                    Use an existing habit
                  </label>
                </div>
              </div>

              {habitMode === 'existing' && (
                <div className="mt-3">
                  <select
                    value={selectedExistingHabitId}
                    onChange={(e) => setSelectedExistingHabitId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required={habitMode === 'existing'}
                  >
                    <option value="">Select a habit...</option>
                    {habits.map((habit) => (
                      <option key={habit.id} value={habit.id}>
                        {habit.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : (prebuiltChallenge ? 'Start Challenge' : 'Create Challenge')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Habit Form Modal */}
      {showHabitForm && (
        <HabitForm
          habitId={null}
          onClose={() => {
            setShowHabitForm(false);
            setSelectedHabitId(null);
          }}
          onHabitCreated={handleHabitCreated}
        />
      )}
    </>
  );
}
