import { useContext } from 'react';
import { useHabits as useHabitsContext } from '../contexts/HabitsContext';

export function useHabits() {
  const context = useHabitsContext();
  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }

  // Helper to filter habits by category
  const getHabitsByCategory = (category: string) => {
    return context.habits.filter(habit => 
      habit.category && habit.category.includes(category)
    );
  };

  // Helper to calculate statistics for a specific habit in the last 30 days
  const getHabitCompletionStats = (habitId: string) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const habitCompletions = context.completions.filter(c => 
      c.habit_id === habitId && new Date(c.completed_date) >= thirtyDaysAgo
    );
    
    const habit = context.habits.find(h => h.id === habitId);
    if (!habit) return { completionsCount: 0, completionRate: 0 };

    const activeDays = habit.frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : (habit.active_days || []);
    let expectedCount = 0;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      if (activeDays.includes(date.getDay())) {
        expectedCount++;
      }
    }

    const completionsCount = habitCompletions.length;
    const completionRate = expectedCount > 0 ? Math.round((completionsCount / expectedCount) * 100) : 0;

    return {
      completionsCount,
      completionRate,
    };
  };

  return {
    ...context,
    getHabitsByCategory,
    getHabitCompletionStats,
  };
}

