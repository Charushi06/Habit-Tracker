import { useState, useEffect } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Flame,
  Calendar,
  TrendingUp,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  Bell,
  Edit,
  Trash2,
  Filter,
  BookOpen,
  Globe2,
  User,
  Target,
} from 'lucide-react';
import { HabitForm } from './HabitForm';
import { CalendarView } from './CalendarView';
import { ProgressView } from './ProgressView';
import { NotificationsPanel } from './NotificationsPanel';
import { HistoryView } from './HistoryView';
import { Challenges } from './Challenges';
import { SuggestedHabits, Onboarding } from './Onboarding';
import { Profile } from './Profile';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useHabits } from '../hooks/useHabits';
import { Footer } from './Footer';
import { TimezoneSettings } from './TimezoneSettings';

type View = 'dashboard' | 'calendar' | 'progress' | 'history' | 'challenges' | 'profile';

const getCategories = (habit: { category?: string[] | null }): string[] => {
  if (habit.category && habit.category.length > 0) {
    return habit.category;
  }
  return ['General'];
};

export function Dashboard() {
  const { habits, loading, toggleCompletion, isCompleted, getStreak, deleteHabit } = useHabits();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTzSettings, setShowTzSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [halfwayShown, setHalfwayShown] = useState(false);
  const [almostDoneShown, setAlmostDoneShown] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayDay = new Date().getDay();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleEditHabit = (habitId: string) => {
    setEditingHabit(habitId);
    setShowHabitForm(true);
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
      setDeletingHabit(null);
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('Failed to delete habit. Please try again.');
    }
  };

  const handleSelectView = (view: View) => {
    setCurrentView(view);
    setShowMobileMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const allCategories = ['All', ...Array.from(new Set(habits.flatMap(getCategories)))].sort();

  const activeHabitsToday = habits.filter((habit) => {
    const frequency = habit.frequency === 'weekly' ? 'custom' : habit.frequency;
    const activeDays =
      frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : habit.active_days || [];
    return activeDays.includes(todayDay);
  });

  const filteredHabitsToday = activeHabitsToday.filter((habit) => {
    if (filterCategory === 'All') return true;
    return getCategories(habit).includes(filterCategory);
  });

  // Use activeHabitsToday (unfiltered) for milestone calculations
  const totalActiveForMilestone = activeHabitsToday.length;
  const completedTodayForMilestone = activeHabitsToday.filter((h) =>
    isCompleted(h.id, today)
  ).length;
  const milestonePercentage =
    totalActiveForMilestone > 0
      ? (completedTodayForMilestone / totalActiveForMilestone) * 100
      : 0;

  // Use filteredHabitsToday for display stats
  const completedToday = filteredHabitsToday.filter((h) => isCompleted(h.id, today)).length;
  const totalActive = filteredHabitsToday.length;
  const reminderCount = habits.filter((h) => h.reminders_enabled && h.reminder_time).length;

  useEffect(() => {
    if (totalActiveForMilestone === 0) {
      setHalfwayShown(false);
      setAlmostDoneShown(false);
      setShowPopup(false);
      return;
    }

    // Reset milestones if progress drops below their thresholds
    if (milestonePercentage < 50) {
      setHalfwayShown(false);
      setAlmostDoneShown(false);
    } else if (milestonePercentage < 70) {
      setAlmostDoneShown(false);
    }

    // Trigger 70% milestone first (higher priority)
    if (milestonePercentage >= 70 && !almostDoneShown) {
      setPopupMessage("You're almost done, keep going!");
      setShowPopup(true);
      setAlmostDoneShown(true);
      if (!halfwayShown) setHalfwayShown(true);
    } else if (milestonePercentage >= 50 && !halfwayShown) {
      setPopupMessage("You're halfway there!");
      setShowPopup(true);
      setHalfwayShown(true);
    }
  }, [milestonePercentage, totalActiveForMilestone, halfwayShown, almostDoneShown]);

  const navTabs = [
    { id: 'dashboard', icon: Menu, label: 'Dashboard' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'progress', icon: TrendingUp, label: 'Progress' },
    { id: 'history', icon: BookOpen, label: 'History' },
    { id: 'challenges', icon: Target, label: 'Challenges' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
        {/* Navbar */}
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">HT</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Habit Tracker
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors md:hidden"
                  aria-label="Toggle navigation menu"
                >
                  {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
                    aria-label={showNotifications ? 'Close notifications panel' : 'Open notifications panel'}
                  >
                    <Bell className="w-5 h-5" />
                    {reminderCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {reminderCount}
                      </span>
                    )}
                  </button>
                  <NotificationsPanel
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>

                <button
                  onClick={() => setShowTzSettings(true)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Timezone settings"
                  aria-label="Open timezone settings"
                >
                  <Globe2 className="w-5 h-5" />
                </button>

                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => signOut()}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 absolute w-full shadow-lg">
              <div className="flex flex-col p-2 space-y-1">
                {navTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectView(tab.id as View)}
                    className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                      currentView === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full mb-24">
          <div className="hidden md:flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as View)}
                className={`px-4 py-2 font-medium transition-colors ${
                  currentView === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </div>

          {currentView === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  {
                    icon: CheckCircle2,
                    color: 'green',
                    title: "Today's Progress",
                    value: `${completedToday}/${totalActive}`,
                  },
                  {
                    icon: Flame,
                    color: 'orange',
                    title: 'Active Habits',
                    value: totalActive,
                  },
                  {
                    icon: Calendar,
                    color: 'blue',
                    title: 'Completion Rate',
                    value: `${totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0}%`,
                  },
                ].map(({ icon: Icon, color, title, value }) => (
                  <div
                    key={title}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg flex items-center justify-center`}
                      >
                        <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                role="progressbar"
                aria-label="Today's habit completion progress"
                aria-valuenow={completedToday}
                aria-valuemin={0}
                aria-valuemax={Math.max(totalActive, 1)}
                className="sr-only"
              >
                {completedToday} of {totalActive} habits completed today
              </div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Today's Habits
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowHabitForm(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Habit</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-6">
                <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by:</span>
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filterCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {activeHabitsToday.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                  <Circle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {habits.length === 0 ? 'No habits yet' : 'No habits for today'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {habits.length === 0
                      ? 'Start building better habits by creating your first one'
                      : 'Enjoy your day off, or create a new habit!'}
                  </p>
                  <button
                    onClick={() => setShowHabitForm(true)}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Your First Habit</span>
                  </button>
                </div>
              ) : filteredHabitsToday.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                  <Filter className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No habits in "{filterCategory}"
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Try selecting a different category or add a new habit to this one.
                  </p>
                  <button
                    onClick={() => setFilterCategory('All')}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Show All Habits
                  </button>
                </div>
              ) : (
                <ul role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredHabitsToday.map((habit) => {
                    const completed = isCompleted(habit.id, today);
                    const streak = getStreak(habit.id);
                    const habitCategories = getCategories(habit);

                    return (
                      <li
                        role="listitem"
                        key={habit.id}
                        className={`rounded-xl p-6 shadow-sm border hover:shadow-md transition-all duration-300 ${
                          completed
                            ? 'bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 opacity-60'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: habit.color + '20' }}
                            >
                              <span className="text-2xl">{habit.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3
                                className={`font-semibold transition-all duration-300 ${
                                  completed
                                    ? 'line-through text-gray-400 dark:text-gray-500'
                                    : 'text-gray-900 dark:text-white'
                                }`}
                              >
                                {habit.name}
                              </h3>
                              <span className="sr-only">
                                Status: {completed ? 'Done' : 'Not done'}
                              </span>
                              {habit.description && (
                                <p
                                  className={`text-sm truncate transition-all duration-300 ${
                                    completed
                                      ? 'text-gray-400 dark:text-gray-500'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`}
                                >
                                  {habit.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleEditHabit(habit.id)}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Edit habit"
                              aria-label={`Edit habit ${habit.name}`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setDeletingHabit(habit.id)}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                              title="Delete habit"
                              aria-label={`Delete habit ${habit.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-wrap gap-2 text-sm">
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <Flame className="w-4 h-4" />
                              <span>{streak} day streak</span>
                            </div>

                            {habitCategories.map((cat) => (
                              <span
                                key={cat}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 rounded-full"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>

                          <button
                            onClick={() => toggleCompletion(habit.id, today)}
                            role="checkbox"
                            aria-checked={completed}
                            className="group p-1.5 rounded-lg active:scale-90 transition-transform duration-150"
                            aria-label={`Mark ${habit.name} as completed`}
                          >
                            <span
                              className={`relative flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-300 ease-in-out ${
                                completed
                                  ? 'bg-green-500/20 dark:bg-green-500/30 border-green-500 text-green-600 dark:text-green-400'
                                  : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                              }`}
                            >
                              <Circle
                                className={`absolute w-6 h-6 transition-all duration-200 ease-out ${
                                  completed ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
                                }`}
                              />
                              <CheckCircle2
                                className={`absolute w-6 h-6 transition-all duration-200 ease-out ${
                                  completed ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                                }`}
                              />
                            </span>
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <SuggestedHabits />
            </>
          )}

          {currentView === 'calendar' && <CalendarView />}
          {currentView === 'progress' && <ProgressView />}
          {currentView === 'history' && <HistoryView />}
          {currentView === 'challenges' && <Challenges />}
          {currentView === 'profile' && <Profile />}
        </main>

        <Footer />
        <TimezoneSettings isOpen={showTzSettings} onClose={() => setShowTzSettings(false)} />

        {showHabitForm && (
          <HabitForm
            habitId={editingHabit}
            onClose={() => {
              setShowHabitForm(false);
              setEditingHabit(null);
            }}
          />
        )}

        <Onboarding />

        {deletingHabit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-habit-dialog-title"
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3
                id="delete-habit-dialog-title"
                className="text-xl font-bold text-gray-900 dark:text-white mb-4"
              >
                Delete Habit?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this habit? This action cannot be undone, but
                your history will be preserved.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeletingHabit(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteHabit(deletingHabit)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {showPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white">

              {/* Close X */}
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
                aria-label="Close popup"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Body */}
              <div className="px-8 py-10 text-center">

                {/* Icon */}
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-4xl">
                    {milestonePercentage >= 70 ? '🔥' : '⚡'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-2 tracking-tight">
                  Great Progress 🎉
                </h3>

                {/* Message */}
                <p className="text-base text-white/90 leading-relaxed mb-6">
                  {milestonePercentage >= 70
                    ? "You're almost done! Just a little more — finish strong today 💪"
                    : "You're halfway there! Keep going, you're doing great 🚀"}
                </p>

                {/* Progress bar */}
                <div className="mb-3 bg-white/20 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500"
                    style={{ width: `${Math.round(milestonePercentage)}%` }}
                  />
                </div>

                {/* Progress label */}
                <p className="text-sm text-white/75 mb-6">
                  {Math.round(milestonePercentage)}% of today's habits completed
                </p>

                {/* CTA Button */}
                <button
                  onClick={() => setShowPopup(false)}
                  className="w-full py-3 rounded-xl bg-white text-blue-600 font-semibold text-sm hover:bg-white/90 active:scale-95 transition-all duration-150 shadow-md"
                >
                  Keep going →
                </button>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}