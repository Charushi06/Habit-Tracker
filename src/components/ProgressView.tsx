import { useHabits } from '../hooks/useHabits';
import { Download, BarChart3, Calendar as CalendarIcon } from 'lucide-react';

export function ProgressView() {
  const { habits, completions, getStreak } = useHabits();

  function exportData(format: 'json' | 'csv') {
    const data = habits.map(habit => {
      const frequency = habit.frequency === 'weekly' ? 'custom' : habit.frequency;
      const activeDaysList = habit.active_days || [];
      const activeDays = frequency === 'daily' ? 'All' : activeDaysList.join(',');

      return {
        name: habit.name,
        description: habit.description,
        frequency: frequency,
        active_days_csv: activeDays,
        active_days_json: activeDaysList,
        streak: getStreak(habit.id),
        totalCompletions: completions.filter(c => c.habit_id === habit.id).length,
        createdAt: habit.created_at,
      };
    });

    if (format === 'json') {
      const jsonData = data.map(d => ({ 
        name: d.name, 
        description: d.description, 
        frequency: d.frequency, 
        active_days: d.active_days_json, 
        streak: d.streak, 
        totalCompletions: d.totalCompletions, 
        createdAt: d.createdAt 
      }));
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      downloadFile(blob, 'habit-tracker-data.json');
    } else {
      const headers = ['Name', 'Description', 'Frequency', 'Active Days (0=Sun)', 'Streak', 'Total Completions', 'Created At'];
      const rows = data.map(d => [
        `"${d.name.replace(/"/g, '""')}"`, // Handle potential commas in names
        `"${d.description.replace(/"/g, '""')}"`,
        d.frequency,
        d.active_days_csv,
        d.streak,
        d.totalCompletions,
        d.createdAt,
      ]);
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadFile(blob, 'habit-tracker-data.csv');
    }
  }

  function downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function getLast30DaysCompletions(habitId: string): number[] {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const completed = completions.some(c => c.habit_id === habitId && c.completed_date === dateStr);
      days.push(completed ? 1 : 0);
    }
    return days;
  }

  // Get weekly completion data for chart
  function getWeeklyData(habitId: string): number[] {
    const weeks = [];
    for (let week = 0; week < 12; week++) {
      let completionsInWeek = 0;
      for (let day = 0; day < 7; day++) {
        const date = new Date();
        date.setDate(date.getDate() - (week * 7 + day));
        const dateStr = date.toISOString().split('T')[0];
        if (completions.some(c => c.habit_id === habitId && c.completed_date === dateStr)) {
          completionsInWeek++;
        }
      }
      weeks.unshift(completionsInWeek);
    }
    return weeks;
  }

  // Circular progress component
  function CircularProgress({ percentage, color, size = 120 }: { percentage: number; color: string; size?: number }) {
    const radius = (size - 12) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{percentage}%</span>
        </div>
      </div>
    );
  }

  // Bar chart component for weekly progress
  function WeeklyBarChart({ data, habitId }: { data: number[]; habitId: string }) {
    const maxValue = Math.max(...data, 7);
    
    return (
      <div className="flex items-end justify-between gap-1 h-32">
        {data.map((value, index) => {
          const heightPercent = (value / maxValue) * 100;
          const habit = habits.find(h => h.id === habitId);
          const color = habit?.color || '#3b82f6';
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                <div
                  className="w-full transition-all duration-1000 ease-out rounded-t-lg"
                  style={{
                    height: `${Math.max(heightPercent * 1.2, 4)}px`,
                    backgroundColor: color,
                    opacity: value > 0 ? 1 : 0.3,
                  }}
                >
                  {value > 0 && (
                    <div className="text-xs text-white text-center font-semibold pt-1">
                      {value}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {index === 0 ? '12w' : index === 11 ? 'now' : ''}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Heatmap calendar component
  function HeatmapCalendar({ habitId }: { habitId: string }) {
    const habit = habits.find(h => h.id === habitId);
    const frequency = (habit?.frequency as any) === 'weekly' ? 'custom' : habit?.frequency;
    const habitActiveDays = frequency === 'daily' 
      ? [0, 1, 2, 3, 4, 5, 6] 
      : (habit?.active_days || []);

    // Get last 90 days
    const days = [];
    for (let i = 89; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      const isActiveDay = habitActiveDays.includes(dayOfWeek);
      const completed = completions.some(c => c.habit_id === habitId && c.completed_date === dateStr);
      
      days.push({ date: dateStr, completed, isActiveDay, dayOfWeek });
    }

    return (
      <div className="grid grid-cols-13 gap-1">
        {days.map((day, index) => {
          let bgColor;
          
          if (!day.isActiveDay) {
            bgColor = 'bg-gray-100 dark:bg-gray-800';
          } else if (day.completed) {
            bgColor = '';
          } else {
            bgColor = 'bg-gray-200 dark:bg-gray-700';
          }

          return (
            <div
              key={index}
              className={`w-2 h-2 rounded-sm ${bgColor} transition-all duration-300 hover:scale-150`}
              style={
                day.completed && day.isActiveDay
                  ? { backgroundColor: habit?.color, opacity: 0.9 }
                  : {}
              }
              title={`${day.date}: ${day.completed ? 'Completed' : day.isActiveDay ? 'Missed' : 'Not scheduled'}`}
            />
          );
        })}
      </div>
    );
  }

  // Updated completion rate logic
  function getCompletionRate(habitId: string): number {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;

    const frequency = habit.frequency === 'weekly' ? 'custom' : habit.frequency;
    const activeDays = frequency === 'daily'
      ? [0, 1, 2, 3, 4, 5, 6]
      : (habit.active_days || []);
    
    if (activeDays.length === 0) return 0;
    
    let activeDaysInPeriod = 0;
    let completedInPeriod = 0;
    const checkDate = new Date();

    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dayOfWeek = checkDate.getDay();
      if (activeDays.includes(dayOfWeek)) {
        // This was an active day
        activeDaysInPeriod++;
        const dateStr = checkDate.toISOString().split('T')[0];
        if (completions.some(c => c.habit_id === habitId && c.completed_date === dateStr)) {
          completedInPeriod++;
        }
      }
      // Move to the previous day
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return activeDaysInPeriod > 0 
      ? Math.round((completedInPeriod / activeDaysInPeriod) * 100) 
      : 0; // Avoid division by zero
  }

  const totalCompletions = completions.length;
  const longestStreak = Math.max(...habits.map(h => getStreak(h.id)), 0);
  
  // This average is now correct as it uses the new getCompletionRate
  const averageRate = habits.length > 0
    ? Math.round(habits.reduce((sum, h) => sum + getCompletionRate(h.id), 0) / habits.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Enhanced Statistics Cards with Visual Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <CircularProgress percentage={Math.min((totalCompletions / Math.max(habits.length * 30, 1)) * 100, 100)} color="#3b82f6" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Completions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalCompletions}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">All time</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <CircularProgress percentage={Math.min((longestStreak / 30) * 100, 100)} color="#f97316" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Longest Streak</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{longestStreak}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">days in a row</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <CircularProgress percentage={averageRate} color="#22c55e" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{averageRate}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">last 30 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Activity Heatmap */}
      {habits.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Overall Activity (Last 90 Days)
          </h3>
          <div className="space-y-3">
            {habits.slice(0, 5).map(habit => (
              <div key={habit.id} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-40 flex-shrink-0">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-sm"
                    style={{ backgroundColor: habit.color + '40' }}
                  >
                    {habit.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {habit.name}
                  </span>
                </div>
                <HeatmapCalendar habitId={habit.id} />
              </div>
            ))}
          </div>
          {habits.length > 5 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              Showing top 5 habits. View individual statistics below for more details.
            </p>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Habit Statistics</h3>
          <div className="flex gap-2">
            <button
              onClick={() => exportData('json')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span>JSON</span>
            </button>
            <button
              onClick={() => exportData('csv')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {habits.map(habit => {
            const streak = getStreak(habit.id);
            const completionRate = getCompletionRate(habit.id);
            const totalHabitCompletions = completions.filter(c => c.habit_id === habit.id).length;
            const last30Days = getLast30DaysCompletions(habit.id);
            const weeklyData = getWeeklyData(habit.id);

            // Get active days for this habit
            const frequency = habit.frequency === 'weekly' ? 'custom' : habit.frequency;
            const habitActiveDays = frequency === 'daily'
              ? [0, 1, 2, 3, 4, 5, 6]
              : (habit.active_days || []);

            return (
              <div key={habit.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-sm"
                      style={{ backgroundColor: habit.color + '30' }}
                    >
                      {habit.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{habit.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{habit.description}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <CircularProgress percentage={completionRate} color={habit.color} size={80} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Stats Cards */}
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-orange-700 dark:text-orange-400 mb-1 font-medium">Current Streak</p>
                          <p className="text-3xl font-bold text-orange-900 dark:text-orange-300">{streak}</p>
                          <p className="text-xs text-orange-600 dark:text-orange-500">days in a row</p>
                        </div>
                        <div className="text-4xl">🔥</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-blue-700 dark:text-blue-400 mb-1 font-medium">Total Completions</p>
                          <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">{totalHabitCompletions}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-500">all time</p>
                        </div>
                        <div className="text-4xl">✅</div>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Bar Chart */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Weekly Progress (12 weeks)</p>
                      <BarChart3 className="w-4 h-4 text-gray-500" />
                    </div>
                    <WeeklyBarChart data={weeklyData} habitId={habit.id} />
                  </div>
                </div>

                {/* Enhanced 30-day view */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Last 30 Days Activity</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {last30Days.filter((d, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (29 - i));
                        return habitActiveDays.includes(date.getDay()) && d === 1;
                      }).length} / {last30Days.filter((_d, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (29 - i));
                        return habitActiveDays.includes(date.getDay());
                      }).length} completed
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {last30Days.map((completed, index) => {
                      const date = new Date();
                      date.setDate(date.getDate() - (29 - index));
                      const dayOfWeek = date.getDay();
                      const isActiveDay = habitActiveDays.includes(dayOfWeek);

                      let bgColor;
                      let borderClass = '';
                      
                      if (!isActiveDay) {
                        bgColor = 'bg-gray-100 dark:bg-gray-800';
                      } else {
                        if (completed) {
                          bgColor = '';
                          borderClass = 'border-2 border-white dark:border-gray-900';
                        } else {
                          bgColor = 'bg-red-200 dark:bg-red-900/30';
                        }
                      }

                      return (
                        <div
                          key={index}
                          className={`flex-1 h-10 rounded transition-all duration-300 hover:scale-110 hover:shadow-lg ${bgColor} ${borderClass}`}
                          style={
                            completed && isActiveDay
                              ? { backgroundColor: habit.color }
                              : {}
                          }
                          title={`${date.toLocaleDateString()}: ${completed ? '✓ Completed' : isActiveDay ? '✗ Missed' : 'Not scheduled'}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>30 days ago</span>
                    <span>Today</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: habit.color }}></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-200 dark:bg-red-900/30"></div>
                    <span>Missed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800"></div>
                    <span>Not scheduled</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}