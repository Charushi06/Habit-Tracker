import { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Habit } from '../lib/supabase'; // Import the Habit type

export function CalendarView() {
  const { habits, isCompleted } = useHabits();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  function previousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  // Returns the list of active habits for the day and the date string
  function getDayData(day: number): { activeHabits: Habit[], dateStr: string } {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay(); // 0 = Sunday

    // Filter habits active on this specific day
    const activeHabits = habits.filter(h => {
      const frequency = h.frequency === 'weekly' ? 'custom' : h.frequency;
      const activeDays = frequency === 'daily'
        ? [0, 1, 2, 3, 4, 5, 6]
        : (h.active_days || []);
      return activeDays.includes(dayOfWeek);
    });

    return { activeHabits, dateStr };
  }

  const days = [];
  // Add empty placeholders for days before the 1st of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{monthName}</h2>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* --- CALENDAR GRID --- */}
        <div className="grid grid-cols-7 gap-1 md:gap-2"> {/* Reduced gap slightly */}
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="text-center text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar Day Cells */}
          {days.map((day, index) => {
            if (day === null) {
              // Empty cell for padding days
              return <div key={`empty-${index}`} />;
            }

            // Get data for this specific day
            const { activeHabits, dateStr } = getDayData(day);
            const date = new Date(year, month, day);
            const isToday =
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear();

            // Limit icons shown directly in the cell
            const maxIconsToShow = 4; // Adjust based on desired cell size/density
            const iconsToDisplay = activeHabits.slice(0, maxIconsToShow);
            const remainingCount = activeHabits.length - maxIconsToShow;

            return (
              <div
                key={day}
                // Cell container styling
                className={`min-h-[6rem] md:min-h-[8rem] p-1 md:p-2 rounded-lg border flex flex-col items-start ${
                  isToday
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30' // Highlight today
                    : 'border-gray-200 dark:border-gray-700' // Default border
                }`}
                title={activeHabits.map(h => h.name).join(', ')} // Tooltip shows all habit names
              >
                {/* Day Number */}
                <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white mb-1 self-end">
                  {day}
                </div>

                {/* Display Habit Icons if any are active */}
                {activeHabits.length > 0 && (
                  <div className="grid grid-cols-2 gap-0.5 mt-1 text-xs md:text-sm w-full"> {/* Grid layout for icons */}
                    {/* Map through habits active today (up to maxIconsToShow) */}
                    {iconsToDisplay.map(habit => {
                      const completed = isCompleted(habit.id, dateStr); // Check if this habit is completed today
                      return (
                        <div
                          key={habit.id}
                          className="flex items-center" // Align icon and checkmark
                          title={`${habit.name}${completed ? ' (Completed)' : ''}`} // Tooltip for icon
                        >
                          {/* Habit Icon */}
                          <span className={`p-0.5 rounded ${completed ? 'opacity-100' : 'opacity-50'}`}> {/* Dim uncompleted */}
                            {habit.icon}
                          </span>
                          {/* Green Checkmark if Completed */}
                          {completed && (
                            <CheckCircle2 className="w-2 h-2 md:w-3 md:h-3 text-green-500 ml-0.5 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                    {/* Show "+X more" if not all icons fit */}
                    {remainingCount > 0 && (
                      <span className="text-gray-500 dark:text-gray-400 text-xs self-center col-span-2 text-center mt-1">
                        +{remainingCount} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- HABIT DETAILS BELOW CALENDAR (Unchanged from previous update) --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Habit Details ({monthName})</h3>
        <div className="space-y-4">
          {habits.map(habit => {
            const frequency = habit.frequency === 'weekly' ? 'custom' : habit.frequency;
            const habitActiveDays = frequency === 'daily'
              ? [0, 1, 2, 3, 4, 5, 6]
              : (habit.active_days || []);

            let activeDayCountInMonth = 0;
            let completedCountInMonth = 0;

            for (let i = 1; i <= daysInMonth; i++) {
              const date = new Date(year, month, i);
              const dayOfWeek = date.getDay();

              if (habitActiveDays.includes(dayOfWeek)) {
                activeDayCountInMonth++;
                const dateStr = date.toISOString().split('T')[0];
                if (isCompleted(habit.id, dateStr)) {
                  completedCountInMonth++;
                }
              }
            }

            const percentage = activeDayCountInMonth > 0
              ? Math.round((completedCountInMonth / activeDayCountInMonth) * 100)
              : 0;

            return (
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
                    <h4 className="font-semibold text-gray-900 dark:text-white">{habit.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {completedCountInMonth} / {activeDayCountInMonth} completions this month
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}