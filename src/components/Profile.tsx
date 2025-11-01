import { useState, useMemo, useRef } from 'react';
import { User, Camera, Edit, Save, X, MapPin, Palette, Mail, User as UserIcon, Upload, Download, Quote, FileText } from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { useAuth } from '../contexts/AuthContext';
import { useHabits } from '../hooks/useHabits';
import { TimezoneSettings } from './TimezoneSettings';
import { ExportModal } from './ExportModal';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export function Profile() {
  const { profile, updateProfile } = useAuth();
  const { habits, completions, getStreak } = useHabits();
  const [isEditing, setIsEditing] = useState(false);
  const [showTimezoneSettings, setShowTimezoneSettings] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    theme: (profile?.theme as 'light' | 'dark') || 'light',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate habit statistics
  const stats = useMemo(() => {
    const totalHabits = habits.length;
    const totalCompletions = completions.length;

    // Calculate 30-day completion rate
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCompletions = completions.filter(c =>
      new Date(c.completed_date) >= thirtyDaysAgo
    );

    // Calculate longest streak across all habits
    const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => getStreak(h.id))) : 0;

    // Calculate completion rate (completions vs expected completions in last 30 days)
    let expectedCompletions = 0;
    let actualCompletions = 0;

    habits.forEach(habit => {
      const activeDays = habit.frequency === 'daily' ? [0,1,2,3,4,5,6] : (habit.active_days || []);
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayOfWeek = date.getDay();
        if (activeDays.includes(dayOfWeek)) {
          expectedCompletions++;
          if (completions.some(c => c.habit_id === habit.id && c.completed_date === date.toISOString().split('T')[0])) {
            actualCompletions++;
          }
        }
      }
    });

    const completionRate = expectedCompletions > 0 ? Math.round((actualCompletions / expectedCompletions) * 100) : 0;

    return {
      totalHabits,
      totalCompletions,
      completionRate,
      longestStreak,
    };
  }, [habits, completions, getStreak]);

  // Calculate chart data
  const chartData = useMemo(() => {
    // Daily completions over last 30 days
    const dailyCompletions = [];
    const labels = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = completions.filter(c => c.completed_date === dateStr).length;
      dailyCompletions.push(count);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    // Category distribution
    const categoryCounts: { [key: string]: number } = {};
    habits.forEach(habit => {
      const categories = habit.category || [];
      categories.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });

    const categoryLabels = Object.keys(categoryCounts);
    const categoryData = Object.values(categoryCounts);

    return {
      dailyCompletions: {
        labels,
        datasets: [{
          label: 'Daily Completions',
          data: dailyCompletions,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        }],
      },
      categoryDistribution: {
        labels: categoryLabels,
        datasets: [{
          data: categoryData,
          backgroundColor: [
            '#3b82f6', // blue
            '#ef4444', // red
            '#10b981', // green
            '#8b5cf6', // purple
            '#f59e0b', // yellow
            '#ec4899', // pink
            '#06b6d4', // cyan
            '#84cc16', // lime
          ],
          borderWidth: 1,
        }],
      },
    };
  }, [habits, completions]);

  // Calculate achievements
  const achievements = useMemo(() => {
    const earnedAchievements = [];

    if (stats.totalHabits >= 1) {
      earnedAchievements.push({
        id: 'first-habit',
        title: 'First Steps',
        description: 'Created your first habit',
        icon: '🎯',
        color: 'bg-blue-500',
      });
    }

    if (stats.totalCompletions >= 10) {
      earnedAchievements.push({
        id: 'ten-completions',
        title: 'Getting Started',
        description: 'Completed 10 habits',
        icon: '⭐',
        color: 'bg-yellow-500',
      });
    }

    if (stats.longestStreak >= 7) {
      earnedAchievements.push({
        id: 'week-streak',
        title: 'Week Warrior',
        description: 'Maintained a 7-day streak',
        icon: '🔥',
        color: 'bg-orange-500',
      });
    }

    if (stats.completionRate >= 80) {
      earnedAchievements.push({
        id: 'consistency-master',
        title: 'Consistency Master',
        description: '80% completion rate',
        icon: '👑',
        color: 'bg-purple-500',
      });
    }

    if (stats.totalHabits >= 5) {
      earnedAchievements.push({
        id: 'habit-master',
        title: 'Habit Master',
        description: 'Created 5 or more habits',
        icon: '🏆',
        color: 'bg-green-500',
      });
    }

    return earnedAchievements;
  }, [stats]);

  // Get recent activity
  const recentActivity = useMemo(() => {
    return completions
      .sort((a, b) => new Date(b.completed_date).getTime() - new Date(a.completed_date).getTime())
      .slice(0, 10)
      .map(completion => {
        const habit = habits.find(h => h.id === completion.habit_id);
        return {
          ...completion,
          habit_name: habit?.name || 'Unknown Habit',
        };
      });
  }, [completions, habits]);

  // Motivational quotes
  const motivationalQuotes = [
    "The journey of a thousand miles begins with a single step.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "Your habits will determine your future.",
    "Small daily improvements lead to stunning results.",
    "The only way to do great work is to love what you do.",
    "Discipline is choosing between what you want now and what you want most.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "The difference between who you are and who you want to be is what you do.",
    "Motivation gets you started. Habit keeps you going.",
    "Every expert was once a beginner."
  ];

  const currentQuote = motivationalQuotes[Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % motivationalQuotes.length];

  // Export data functions
  const handleExportData = () => {
    const data = {
      profile: {
        full_name: profile?.full_name,
        email: profile?.email,
        created_at: profile?.created_at,
      },
      habits: habits.map(h => ({
        id: h.id,
        name: h.name,
        description: h.description,
        frequency: h.frequency,
        category: h.category,
        active_days: h.active_days,
        created_at: h.created_at,
      })),
      completions: completions.map(c => ({
        habit_id: c.habit_id,
        completed_date: c.completed_date,
        created_at: c.created_at,
      })),
      export_date: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!profile) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Habit Tracker Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Date
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Profile Information
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Profile Information', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${profile.full_name || 'User'}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Email: ${profile.email}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Member since: ${new Date(profile.created_at).toLocaleDateString()}`, 20, yPosition);
    yPosition += 15;

    // Statistics
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistics', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Habits: ${stats.totalHabits}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Total Completions: ${stats.totalCompletions}`, 20, yPosition);
    yPosition += 8;
    doc.text(`30-Day Completion Rate: ${stats.completionRate}%`, 20, yPosition);
    yPosition += 8;
    doc.text(`Longest Streak: ${stats.longestStreak} days`, 20, yPosition);
    yPosition += 20;

    // Habits List
    if (habits.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Habits', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);

      habits.forEach((habit, index) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${index + 1}. ${habit.name}`, 20, yPosition);
        yPosition += 6;
        doc.setFontSize(10);
        doc.text(`   ${habit.description || 'No description'}`, 20, yPosition);
        yPosition += 6;
        doc.text(`   Frequency: ${habit.frequency} | Categories: ${habit.category?.join(', ') || 'None'}`, 20, yPosition);
        yPosition += 8;
        doc.setFontSize(12);
      });
    }

    // Recent Completions
    if (completions.length > 0) {
      yPosition += 10;
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Recent Completions (Last 10)', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const recentCompletions = completions
        .sort((a, b) => new Date(b.completed_date).getTime() - new Date(a.completed_date).getTime())
        .slice(0, 10);

      recentCompletions.forEach((completion, index) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        const habit = habits.find(h => h.id === completion.habit_id);
        doc.text(`${index + 1}. ${habit?.name || 'Unknown Habit'} - ${new Date(completion.completed_date).toLocaleDateString()}`, 20, yPosition);
        yPosition += 6;
      });
    }

    // Save the PDF
    doc.save(`habit-tracker-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: formData.full_name,
        theme: formData.theme as 'light' | 'dark',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      theme: profile?.theme || 'light',
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: data.publicUrl });

      alert('Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                profile.full_name?.charAt(0).toUpperCase() || <User className="w-12 h-12" />
              )}
            </div>
            {/* Avatar upload button */}
            <button
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
              title={uploadingAvatar ? "Uploading..." : "Change avatar"}
            >
              {uploadingAvatar ? (
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {profile.full_name || 'User'}
              </h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Timezone</p>
                  <p className="text-gray-900 dark:text-white">{profile.timezone || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Theme</p>
                  <p className="text-gray-900 dark:text-white capitalize">{profile.theme}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Member since</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value as 'light' | 'dark' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timezone
                </label>
                <button
                  onClick={() => setShowTimezoneSettings(true)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  {profile.timezone || 'Select timezone'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Habit Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Habit Statistics</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalHabits}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Habits</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="w-8 h-8 bg-green-600 dark:bg-green-400 rounded-full flex items-center justify-center text-white font-bold">
                ✓
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCompletions}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Completions</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="w-8 h-8 bg-purple-600 dark:bg-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                %
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">30-Day Completion Rate</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="w-8 h-8 bg-orange-600 dark:bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                🔥
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.longestStreak}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</div>
          </div>
        </div>
      </div>

      {/* Statistics Charts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Statistics Charts</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Completions Chart */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Completions (Last 30 Days)</h3>
            <div className="h-64">
              <Bar
                data={chartData.dailyCompletions}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Category Distribution Chart */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Habits by Category</h3>
            <div className="h-64 flex items-center justify-center">
              {chartData.categoryDistribution.labels.length > 0 ? (
                <Pie
                  data={chartData.categoryDistribution}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <p>No category data available</p>
                  <p className="text-sm">Add habits with categories to see the distribution</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



      {/* Motivational Quote */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Quote className="w-6 h-6" />
          <h2 className="text-xl font-bold">Daily Motivation</h2>
        </div>
        <blockquote className="text-lg italic mb-4">
          "{currentQuote}"
        </blockquote>
        <p className="text-blue-100 text-sm">
          Remember: Every small step counts towards building lasting habits.
        </p>
      </div>

      {/* Data Export */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Download className="w-6 h-6 text-green-500" />
          Data Export
        </h2>

        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Export all your habit data including profile information, habits, and completion history.
            This data can be used for backup, analysis, or importing into other applications.
          </p>

          <div className="flex gap-4">
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-5 h-5" />
              Export as JSON
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export as PDF
            </button>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>JSON: Complete data export for backup and analysis</p>
            <p>PDF: Filtered report with charts and statistics</p>
          </div>
        </div>
      </div>

      {/* Timezone Settings Modal */}
      <TimezoneSettings
        isOpen={showTimezoneSettings}
        onClose={() => setShowTimezoneSettings(false)}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}
