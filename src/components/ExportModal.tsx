import { useState, useEffect } from 'react';
import { X, Download, Calendar, Filter, Eye, BarChart3 } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { useAuth } from '../contexts/AuthContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExportFilters {
  dateRange: {
    from: string;
    to: string;
  };
  selectedHabits: string[];
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { habits, completions } = useHabits();
  const { user } = useAuth();
  const [filters, setFilters] = useState<ExportFilters>({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0],
    },
    selectedHabits: [],
  });
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize selected habits to all habits by default
  useEffect(() => {
    if (isOpen && habits.length > 0) {
      setFilters(prev => ({
        ...prev,
        selectedHabits: habits.map(h => h.id),
      }));
    }
  }, [isOpen, habits]);

  if (!isOpen) return null;

  const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value,
      },
    }));
  };

  const handleHabitToggle = (habitId: string) => {
    setFilters(prev => ({
      ...prev,
      selectedHabits: prev.selectedHabits.includes(habitId)
        ? prev.selectedHabits.filter(id => id !== habitId)
        : [...prev.selectedHabits, habitId],
    }));
  };

  const handleSelectAllHabits = () => {
    setFilters(prev => ({
      ...prev,
      selectedHabits: habits.map(h => h.id),
    }));
  };

  const handleDeselectAllHabits = () => {
    setFilters(prev => ({
      ...prev,
      selectedHabits: [],
    }));
  };

  // Calculate preview data
  const selectedHabitsData = habits.filter(h => filters.selectedHabits.includes(h.id));
  const filteredCompletions = completions.filter(c => {
    const completionDate = new Date(c.completed_date);
    const fromDate = new Date(filters.dateRange.from);
    const toDate = new Date(filters.dateRange.to);
    return completionDate >= fromDate && completionDate <= toDate;
  });

  const totalCompletions = selectedHabitsData.reduce((sum, habit) => {
    return sum + filteredCompletions.filter(c => c.habit_id === habit.id).length;
  }, 0);

  const averageCompletionRate = selectedHabitsData.length > 0
    ? Math.round((totalCompletions / (selectedHabitsData.length * Math.ceil((new Date(filters.dateRange.to).getTime() - new Date(filters.dateRange.from).getTime()) / (1000 * 60 * 60 * 24)))) * 100)
    : 0;

  const handleExport = async () => {
    if (selectedHabitsData.length === 0) {
      alert('Please select at least one habit to export.');
      return;
    }

    setIsExporting(true);
    try {
      const { generateHabitsPDF } = await import('../utils/pdfExport');
      const habitsWithCompletions = selectedHabitsData.map(habit => ({
        ...habit,
        completed_dates: filteredCompletions
          .filter(c => c.habit_id === habit.id)
          .map(c => c.completed_date),
      }));

      await generateHabitsPDF({
        habits: habitsWithCompletions,
        userName: user?.email?.split('@')[0] || 'User',
        dateRange: filters.dateRange,
      });

      onClose();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Export Habit Data
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Filter and export your habit progress as a PDF report
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
          {/* Filters Panel */}
          <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
            <div className="space-y-6">
              {/* Date Range */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Date Range</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={filters.dateRange.from}
                      onChange={(e) => handleDateRangeChange('from', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={filters.dateRange.to}
                      onChange={(e) => handleDateRangeChange('to', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Habit Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Select Habits</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({filters.selectedHabits.length} selected)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAllHabits}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleDeselectAllHabits}
                      className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {habits.map((habit) => (
                    <label
                      key={habit.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.selectedHabits.includes(habit.id)}
                        onChange={() => handleHabitToggle(habit.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: habit.color + '20' }}
                      >
                        {habit.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {habit.name}
                        </p>
                        {habit.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {habit.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Preview</h3>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {showPreview ? 'Hide Details' : 'Show Details'}
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Selected Habits
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedHabitsData.length}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Completions
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalCompletions}
                </p>
              </div>
            </div>

            {/* Detailed Preview */}
            {showPreview && (
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white">Selected Habits:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedHabitsData.map((habit) => {
                    const habitCompletions = filteredCompletions.filter(c => c.habit_id === habit.id).length;

                    // Calculate active days for this habit in the date range
                    const fromDate = new Date(filters.dateRange.from);
                    const toDate = new Date(filters.dateRange.to);
                    const frequency = habit.frequency === 'weekly' ? 'custom' : habit.frequency;
                    const activeDays = frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : habit.active_days || [];

                    let activeDaysCount = 0;
                    for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
                      if (activeDays.includes(d.getDay())) {
                        activeDaysCount++;
                      }
                    }

                    const rate = activeDaysCount > 0 ? Math.round((habitCompletions / activeDaysCount) * 100) : 0;

                    return (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center text-sm"
                            style={{ backgroundColor: habit.color + '20' }}
                          >
                            {habit.icon}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {habit.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {habitCompletions} completions
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {rate}% completion rate ({habitCompletions}/{activeDaysCount} days)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Export Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || selectedHabitsData.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
