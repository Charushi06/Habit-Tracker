import { useHabits } from '../hooks/useHabits';
import { Download, TrendingUp, Award, Target, FileText } from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function ProgressView() {
  const { habits, completions, getStreak } = useHabits();
  const [animatedValues, setAnimatedValues] = useState<{ [key: string]: number }>({});

  // --- EXISTING JSON/CSV EXPORT LOGIC ---
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
        `"${d.name.replace(/"/g, '""')}"`, 
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

  // --- NEW PDF EXPORT LOGIC ---
  function exportPDF() {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Habit Tracker Progress Report', 14, 22);
    
    // Date
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Table Data Preparation
    const tableColumn = ["Habit Name", "Frequency", "Streak", "Total Completions", "Completion Rate"];
    const tableRows = habits.map(habit => {
      const frequency = habit.frequency === 'weekly' ? 'custom' : habit.frequency;
      const rate = getCompletionRate(habit.id);
      const total = completions.filter(c => c.habit_id === habit.id).length;
      const streak = getStreak(habit.id);

      return [
        habit.name,
        frequency,
        `${streak} days`,
        total,
        `${rate}%`
      ];
    });

    // Generate Table
    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [63, 81, 181] }, // Blue header
      styles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save('habit-tracker-report.pdf');
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

    for (let i = 0; i < 30; i++) { 
      const dayOfWeek = checkDate.getDay();
      if (activeDays.includes(dayOfWeek)) {
        activeDaysInPeriod++;
        const dateStr = checkDate.toISOString().split('T')[0];
        if (completions.some(c => c.habit_id === habitId && c.completed_date === dateStr)) {
          completedInPeriod++;
        }
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return activeDaysInPeriod > 0 
      ? Math.round((completedInPeriod / activeDaysInPeriod) * 100) 
      : 0; 
  }

  const totalCompletions = completions.length;
  const longestStreak = Math.max(...habits.map(h => getStreak(h.id)), 0);
  
  const averageRate = habits.length > 0
    ? Math.round(habits.reduce((sum, h) => sum + getCompletionRate(h.id), 0) / habits.length)
    : 0;

  useEffect(() => {
    const values: { [key: string]: number } = {};
    habits.forEach(habit => {
      values[habit.id] = 0;
    });
    setAnimatedValues(values);

    const timer = setTimeout(() => {
      const newValues: { [key: string]: number } = {};
      habits.forEach(habit => {
        newValues[habit.id] = getCompletionRate(habit.id);
      });
      setAnimatedValues(newValues);
    }, 100);

    return () => clearTimeout(timer);
  }, [habits, getCompletionRate]);

  const getLast7DaysTrend = () => {
    const days = [];
    const counts = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayCompletions = completions.filter(c => c.completed_date === dateStr).length;
      days.push(dayName);
      counts.push(dayCompletions);
    }
    
    return { days, counts };
  };

  const trendData = getLast7DaysTrend();

  const lineChartData = {
    labels: trendData.days,
    datasets: [
      {
        label: 'Daily Completions',
        data: trendData.counts,
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
      },
      x: {
        ticks: { color: '#9ca3af' },
        grid: { display: false },
      },
    },
  };

  const habitCompletionData = {
    labels: habits.map(h => h.name),
    datasets: [
      {
        data: habits.map(h => completions.filter(c => c.habit_id === h.id).length),
        backgroundColor: habits.map(h => h.color),
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#9ca3af',
          padding: 15,
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
  };

  const completionRatesData = {
    labels: habits.map(h => h.name.length > 15 ? h.name.substring(0, 15) + '...' : h.name),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: habits.map(h => getCompletionRate(h.id)),
        backgroundColor: habits.map(h => h.color),
        borderRadius: 8,
        maxBarThickness: 50,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: function(context: { parsed: { y: number | null } }) {
            return `Completion Rate: ${context.parsed.y ?? 0}%`;
          }
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: string | number) { return value + '%'; },
          color: '#9ca3af',
        },
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
      },
      x: {
        ticks: { color: '#9ca3af' },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all hover:scale-105">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Completions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCompletions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all hover:scale-105">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{longestStreak} days</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transform transition-all hover:scale-105">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Rate (30d)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {habits.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              7-Day Completion Trend
            </h3>
            <div style={{ height: '250px' }}>
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Completion Distribution
            </h3>
            <div style={{ height: '250px' }}>
              <Doughnut data={habitCompletionData} options={doughnutOptions} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Completion Rates by Habit (Last 30 Days)
            </h3>
            <div style={{ height: '300px' }}>
              <Bar data={completionRatesData} options={barChartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Habit Statistics Section */}
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
            {/* --- NEW BUTTON --- */}
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            {/* ------------------ */}
          </div>
        </div>

        <div className="space-y-6">
          {habits.map(habit => {
            const streak = getStreak(habit.id);
            const completionRate = getCompletionRate(habit.id);
            const totalHabitCompletions = completions.filter(c => c.habit_id === habit.id).length;
            const last30Days = getLast30DaysCompletions(habit.id);

            const frequency = habit.frequency === 'weekly' ? 'custom' : habit.frequency;
            const habitActiveDays = frequency === 'daily'
              ? [0, 1, 2, 3, 4, 5, 6]
              : (habit.active_days || []);

            return (
              <div key={habit.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: habit.color + '20' }}
                  >
                    {habit.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{habit.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{habit.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Streak</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{streak} days</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completion Rate</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{completionRate}%</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Completions</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{totalHabitCompletions}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Progress</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{completionRate}%</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${animatedValues[habit.id] || 0}%`,
                        backgroundColor: habit.color,
                        boxShadow: `0 0 10px ${habit.color}40`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Last 30 Days</p>
                  <div className="flex gap-1">
                    {last30Days.map((completed, index) => {
                      const date = new Date();
                      date.setDate(date.getDate() - (29 - index));
                      const dayOfWeek = date.getDay();
                      const isActiveDay = habitActiveDays.includes(dayOfWeek);

                      let bgColor;
                      if (!isActiveDay) {
                        bgColor = 'bg-gray-100 dark:bg-gray-800'; 
                      } else {
                        bgColor = completed
                          ? 'bg-green-500' 
                          : 'bg-gray-200 dark:bg-gray-700'; 
                      }

                      return (
                        <div
                          key={index}
                          className={`flex-1 h-8 rounded ${bgColor}`}
                          title={date.toDateString()}
                        />
                      );
                    })}
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