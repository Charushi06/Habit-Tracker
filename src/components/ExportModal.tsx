import { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Calendar, 
  Filter, 
  Eye, 
  BarChart3, 
  FileText, 
  FileJson, 
  FileSpreadsheet, 
  CheckSquare 
} from 'lucide-react';
import { useHabits } from '../hooks/useHabits';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  // New optional props to handle the exports from ProgressView
  onExportJSON?: () => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
}

interface ExportFilters {
  dateRange: {
    from: string;
    to: string;
  };
  selectedHabits: string[];
}

export function ExportModal({ 
  isOpen, 
  onClose, 
  onExportJSON, 
  onExportCSV, 
  onExportPDF 
}: ExportModalProps) {
  const { habits, completions } = useHabits();
  
  const [filters, setFilters] = useState<ExportFilters>({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0],
    },
    selectedHabits: [],
  });
  
  const [showPreview, setShowPreview] = useState(true); // Default to true to show options immediately

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
        
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
                Select format to download your progress
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

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Filters Panel */}
          <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
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
                      ({filters.selectedHabits.length})
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAllHabits}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      All
                    </button>
                    <button
                      onClick={handleDeselectAllHabits}
                      className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      None
                    </button>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {habits.map((habit) => (
                    <label
                      key={habit.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        filters.selectedHabits.includes(habit.id) 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        filters.selectedHabits.includes(habit.id)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      }`}>
                        {filters.selectedHabits.includes(habit.id) && <CheckSquare className="w-3 h-3" />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={filters.selectedHabits.includes(habit.id)}
                        onChange={() => handleHabitToggle(habit.id)}
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
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview & Actions Panel */}
          <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900/50 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Summary</h3>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Selected</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedHabitsData.length}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Records</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalCompletions}
                </p>
              </div>
            </div>

            <div className="mt-auto">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Export Options</h4>
                <div className="space-y-3">
                    {/* JSON Button */}
                    <button
                      onClick={() => { onExportJSON?.(); onClose(); }}
                      className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                          <FileJson className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">JSON Format</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Raw data structure</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">.json</span>
                    </button>

                    {/* CSV Button */}
                    <button
                      onClick={() => { onExportCSV?.(); onClose(); }}
                      className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">CSV Format</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Spreadsheet compatible</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">.csv</span>
                    </button>

                    {/* PDF Button */}
                    <button
                      onClick={() => { onExportPDF?.(); onClose(); }}
                      className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-500 dark:hover:border-red-500 hover:shadow-md transition-all group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">PDF Report</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Formatted document</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">.pdf</span>
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}