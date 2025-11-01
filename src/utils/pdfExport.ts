import jsPDF from 'jspdf';
import Chart from 'chart.js/auto';

// Modern minimalist color palette
const theme = {
  // Primary colors
  primary: '#0F172A',      // Deep slate
  primaryLight: '#1E293B', // Slate
  accent: '#3B82F6',       // Vibrant blue
  accentLight: '#60A5FA',  // Light blue
  accentGlow: '#93C5FD',   // Soft blue
  
  // Neutrals
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  
  // Semantic colors
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#EF4444',
  errorLight: '#F87171',
  
  // Gradients
  gradientStart: '#3B82F6',
  gradientEnd: '#8B5CF6',
};

type Habit = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  frequency: 'daily' | 'custom';
  active_days: number[];
  target_days: number;
  is_active: boolean;
  reminder_time: string | null;
  reminders_enabled: boolean;
  browser_notifications: boolean;
  email_notifications: boolean;
  snoozed_until: string | null;
  snooze_duration: number | null;
  created_at: string;
  updated_at: string;
  completed_dates?: string[];
};

interface PDFExportOptions {
  habits: Habit[];
  userName?: string;
  dateRange?: { from: string; to: string };
  includeStreak?: boolean;
  includeProgress?: boolean;
}

// Helper to create chart image
const createChartImage = async (chartConfig: any, width: number = 800, height: number = 400): Promise<string> => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  const chart = new (Chart as any)(ctx, chartConfig);
  await new Promise(resolve => setTimeout(resolve, 150));
  const imageData = canvas.toDataURL('image/png');
  chart.destroy();
  return imageData;
};

// Helper to add chart to PDF
const addChartToPDF = async (doc: jsPDF, chartConfig: any, x: number, y: number, width: number, height: number) => {
  try {
    const chartImage = await createChartImage(chartConfig, width * 3, height * 3);
    doc.addImage(chartImage, 'PNG', x, y, width, height);
  } catch (error) {
    console.error('Error adding chart:', error);
    doc.setFontSize(10);
    doc.setTextColor(theme.gray400);
    doc.text('Chart unavailable', x + width / 2, y + height / 2, { align: 'center' });
  }
};

export const generateHabitsPDF = async (options: PDFExportOptions): Promise<void> => {
  const { habits, userName = 'User', dateRange, includeStreak = true, includeProgress = true } = options;

  // Remove duplicates
  const uniqueHabits = habits.filter((habit, index, self) =>
    index === self.findIndex(h => h.id === habit.id)
  );

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;
  let pageNum = 1;

  // Modern decorative element
  const addAccentLine = (y: number, width: number = contentWidth, height: number = 1) => {
    doc.setFillColor(theme.accent);
    doc.rect(margin, y, width, height, 'F');
  };

  // Sleek header
  const addHeader = () => {
    doc.setFillColor(theme.white);
    doc.rect(0, 0, pageWidth, 15, 'F');
    
    // Accent line at top
    doc.setFillColor(theme.accent);
    doc.rect(0, 0, pageWidth, 2, 'F');
    
    doc.setTextColor(theme.gray700);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('HABIT TRACKER', margin, 10);
    
    doc.setTextColor(theme.gray400);
    doc.setFontSize(8);
    doc.text(`Page ${pageNum}`, pageWidth - margin, 10, { align: 'right' });
  };

  // Minimalist footer
  const addFooter = () => {
    const footerY = pageHeight - 10;
    doc.setFontSize(7);
    doc.setTextColor(theme.gray400);
    doc.setFont('helvetica', 'normal');
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    doc.text(`Generated ${date}`, pageWidth / 2, footerY, { align: 'center' });
  };

  // Check for new page
  const checkNewPage = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - 25) {
      addFooter();
      doc.addPage();
      pageNum++;
      yPos = 25;
      addHeader();
    }
  };

  // === COVER PAGE ===
  addHeader();
  
  // Gradient effect simulation with overlapping rectangles
  doc.setFillColor(theme.primary);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Decorative accent elements
  doc.setFillColor(theme.accent);
  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.circle(pageWidth - 30, 30, 60, 'F');
  doc.circle(20, pageHeight - 20, 80, 'F');
  doc.setGState(new doc.GState({ opacity: 1 }));
  
  // Title
  doc.setTextColor(theme.white);
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.text('Habit Tracker', pageWidth / 2, pageHeight / 2 - 30, { align: 'center' });
  
  // Accent line under title
  doc.setFillColor(theme.accent);
  doc.rect(pageWidth / 2 - 40, pageHeight / 2 - 22, 80, 2, 'F');
  
  // Subtitle
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(theme.gray300);
  doc.text('Progress Report', pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });
  
  // User info
  doc.setFontSize(14);
  doc.setTextColor(theme.white);
  doc.setFont('helvetica', 'normal');
  doc.text(`Prepared for ${userName}`, pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });
  
  // Date range
  if (dateRange) {
    doc.setFontSize(11);
    doc.setTextColor(theme.accentLight);
    const fromDate = new Date(dateRange.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const toDate = new Date(dateRange.to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    doc.text(`${fromDate} — ${toDate}`, pageWidth / 2, pageHeight / 2 + 25, { align: 'center' });
  }
  
  // Motivational quote
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(theme.gray400);
  const quote = '"We are what we repeatedly do. Excellence, then, is not an act, but a habit."';
  doc.text(quote, pageWidth / 2, pageHeight - 40, { align: 'center', maxWidth: contentWidth - 40 });
  doc.setFontSize(9);
  doc.text('— Aristotle', pageWidth / 2, pageHeight - 32, { align: 'center' });

  // === SUMMARY PAGE ===
  doc.addPage();
  pageNum++;
  yPos = 25;
  addHeader();
  
  // Calculate comprehensive metrics
  const totalHabits = uniqueHabits.length;
  const activeHabits = uniqueHabits.filter(h => h.is_active).length;
  const inactiveHabits = totalHabits - activeHabits;
  const totalCompletions = uniqueHabits.reduce((sum, h) => sum + (h.completed_dates?.length || 0), 0);
  const longestStreak = Math.max(...uniqueHabits.map(h => h.completed_dates?.length || 0), 0);
  const avgCompletion = totalHabits > 0 ? Math.round(totalCompletions / totalHabits) : 0;

  // Calculate success rate and performance insights
  const totalPossibleDays = uniqueHabits.reduce((sum, h) => {
    const daysSinceCreation = h.created_at ? Math.ceil((Date.now() - new Date(h.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 1;
    return sum + daysSinceCreation;
  }, 0);
  const overallSuccessRate = totalPossibleDays > 0 ? Math.round((totalCompletions / totalPossibleDays) * 100) : 0;

  // Weekly performance (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });
  const weeklyCompletions = uniqueHabits.reduce((sum, h) => {
    const completions = h.completed_dates || [];
    return sum + last7Days.filter(date => completions.includes(date)).length;
  }, 0);
  const weeklyTarget = activeHabits * 7;
  const weeklySuccessRate = weeklyTarget > 0 ? Math.round((weeklyCompletions / weeklyTarget) * 100) : 0;

  // Best performing habits
  const bestHabits = uniqueHabits
    .map(h => ({
      name: h.name,
      completions: h.completed_dates?.length || 0,
      rate: h.created_at ? Math.round(((h.completed_dates?.length || 0) / Math.ceil((Date.now() - new Date(h.created_at).getTime()) / (1000 * 60 * 60 * 24))) * 100) : 0
    }))
    .sort((a, b) => b.completions - a.completions)
    .slice(0, 3);

  // Habit categories analysis
  const dailyHabits = uniqueHabits.filter(h => h.frequency === 'daily').length;
  const customHabits = uniqueHabits.filter(h => h.frequency === 'custom').length;

  // Achievement badges
  const achievements = [];
  if (longestStreak >= 30) achievements.push('30-Day Streak Master');
  if (overallSuccessRate >= 80) achievements.push('Consistency Champion');
  if (totalCompletions >= 100) achievements.push('Century Club');
  if (activeHabits >= 5) achievements.push('Habit Builder');
  if (weeklySuccessRate >= 90) achievements.push('Weekly Warrior');
  
  // Page title
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(theme.primary);
  doc.text('Overview', margin, yPos);
  yPos += 3;
  addAccentLine(yPos, 40, 2);
  yPos += 15;
  
  // Stats cards
  const cardWidth = (contentWidth - 10) / 2;
  const cardHeight = 28;
  const cards = [
    { label: 'Total Habits', value: totalHabits.toString(), icon: '●' },
    { label: 'Active Habits', value: activeHabits.toString(), icon: '✓' },
    { label: 'Total Completions', value: totalCompletions.toString(), icon: '★' },
    { label: 'Longest Streak', value: `${longestStreak} days`, icon: '🔥' },
  ];
  
  cards.forEach((card, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + (col * (cardWidth + 10));
    const y = yPos + (row * (cardHeight + 8));
    
    // Card background
    doc.setFillColor(theme.gray50);
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');
    
    // Card border
    doc.setDrawColor(theme.gray200);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'S');
    
    // Value
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(theme.primary);
    doc.text(card.value, x + 8, y + 15);
    
    // Label
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(theme.gray600);
    doc.text(card.label, x + 8, y + 22);
  });
  
  yPos += (Math.ceil(cards.length / 2) * (cardHeight + 8)) + 15;
  
  // === CHARTS SECTION ===
  checkNewPage(100);
  
  // Section title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(theme.primary);
  doc.text('Analytics', margin, yPos);
  yPos += 3;
  addAccentLine(yPos, 40, 2);
  yPos += 15;
  
  // Progress Chart
  if (uniqueHabits.length > 0) {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });
    
    const chartData = uniqueHabits.slice(0, 5).map((habit, idx) => {
      const completions = habit.completed_dates || [];
      const dailyProgress = last30Days.map(date => completions.includes(date) ? 1 : 0);
      const colors = [theme.accent, theme.success, theme.warning, '#8B5CF6', '#EC4899'];
      
      return {
        label: habit.name.length > 20 ? habit.name.substring(0, 20) + '...' : habit.name,
        data: dailyProgress,
        backgroundColor: colors[idx] + 'B3',
        borderColor: colors[idx],
        borderWidth: 2,
        borderRadius: 4,
        barPercentage: 0.7,
      };
    });
    
    const barChartConfig = {
      type: 'bar' as const,
      data: {
        labels: last30Days.map(date => {
          const d = new Date(date);
          return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        }),
        datasets: chartData,
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom' as const,
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              font: { size: 10, family: 'Helvetica', weight: '500' },
              color: theme.gray700,
              padding: 12,
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          title: {
            display: true,
            text: 'Daily Progress (Last 30 Days)',
            font: { size: 14, family: 'Helvetica', weight: 'bold' },
            color: theme.primary,
            padding: { bottom: 20 },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: {
              color: theme.gray500,
              font: { size: 8 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 15,
            },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: {
              color: theme.gray200,
              drawBorder: false,
            },
            ticks: {
              color: theme.gray500,
              font: { size: 9 },
              stepSize: 1,
            },
          },
        },
        layout: { padding: 15 },
      },
    };
    
  await addChartToPDF(doc, barChartConfig, margin, yPos, contentWidth, 75);
  yPos += 85;
  }

  // === COMPREHENSIVE SUMMARY SECTION ===
  checkNewPage(120);

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(theme.primary);
  doc.text('Comprehensive Summary', margin, yPos);
  yPos += 3;
  addAccentLine(yPos, 60, 2);
  yPos += 15;

  // Performance Insights
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(theme.primary);
  doc.text('Performance Insights', margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(theme.gray700);
  doc.text(`Overall Success Rate: ${overallSuccessRate}%`, margin, yPos);
  yPos += 8;
  doc.text(`Weekly Success Rate: ${weeklySuccessRate}% (${weeklyCompletions}/${weeklyTarget} completions)`, margin, yPos);
  yPos += 8;
  doc.text(`Active vs Inactive Habits: ${activeHabits} active, ${inactiveHabits} inactive`, margin, yPos);
  yPos += 8;
  doc.text(`Habit Distribution: ${dailyHabits} daily, ${customHabits} custom`, margin, yPos);
  yPos += 15;

  // Best Performing Habits
  if (bestHabits.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(theme.primary);
    doc.text('Top Performing Habits', margin, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(theme.gray700);
    bestHabits.forEach((habit, index) => {
      doc.text(`${index + 1}. ${habit.name} - ${habit.completions} completions (${habit.rate}% rate)`, margin, yPos);
      yPos += 7;
    });
    yPos += 5;
  }

  // Achievements
  if (achievements.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(theme.primary);
    doc.text('Achievements Unlocked', margin, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(theme.gray700);
    achievements.forEach((achievement) => {
      doc.text(`- ${achievement}`, margin, yPos);
      yPos += 7;
    });
    yPos += 10;
  }

  // Recommendations
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(theme.primary);
  doc.text('Recommendations', margin, yPos);
  yPos += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(theme.gray700);

  if (weeklySuccessRate < 70) {
    doc.text('- Focus on building consistency - aim for 70%+ weekly completion rate', margin, yPos);
    yPos += 7;
  }
  if (inactiveHabits > activeHabits) {
    doc.text('- Consider reactivating some inactive habits or removing unused ones', margin, yPos);
    yPos += 7;
  }
  if (longestStreak < 7) {
    doc.text('- Work on building longer streaks - consistency leads to habit formation', margin, yPos);
    yPos += 7;
  }
  if (activeHabits < 3) {
    doc.text('- Consider adding more habits to build a comprehensive routine', margin, yPos);
    yPos += 7;
  }
  doc.text('- Keep tracking your progress - consistency is key to success!', margin, yPos);
  yPos += 15;

  // Motivational closing
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(theme.gray600);
  doc.text('"Success is the sum of small efforts, repeated day in and day out."', margin, yPos);
  yPos += 8;
  doc.setFontSize(9);
  doc.setTextColor(theme.gray500);
  doc.text('— Robert Collier', margin, yPos);
  yPos += 20;

  // Completion Rate Doughnut
  checkNewPage(90);
  
  const completionData = uniqueHabits.slice(0, 6).map((habit, idx) => {
    const totalDays = habit.created_at ? 
      Math.ceil((Date.now() - new Date(habit.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 1;
    const completed = habit.completed_dates?.length || 0;
    const rate = totalDays > 0 ? Math.round((completed / totalDays) * 100) : 0;
    const colors = [theme.accent, theme.success, theme.warning, '#8B5CF6', '#EC4899', '#14B8A6'];
    
    return {
      label: habit.name.length > 18 ? habit.name.substring(0, 18) + '...' : habit.name,
      value: rate,
      color: colors[idx],
    };
  });
  
  const doughnutConfig = {
    type: 'doughnut' as const,
    data: {
      labels: completionData.map(d => d.label),
      datasets: [{
        data: completionData.map(d => d.value),
        backgroundColor: completionData.map(d => d.color + 'CC'),
        borderColor: theme.white,
        borderWidth: 3,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            font: { size: 10, family: 'Helvetica', weight: '500' },
            color: theme.gray700,
            padding: 10,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        title: {
          display: true,
          text: 'Completion Rates',
          font: { size: 14, family: 'Helvetica', weight: 'bold' },
          color: theme.primary,
          padding: { bottom: 20 },
        },
      },
      layout: { padding: 15 },
    },
  };
  
  await addChartToPDF(doc, doughnutConfig, margin + 10, yPos, contentWidth - 20, 70);
  yPos += 80;
  
  // === HABITS TABLE ===
  checkNewPage(50);
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(theme.primary);
  doc.text('Habits Details', margin, yPos);
  yPos += 3;
  addAccentLine(yPos, 40, 2);
  yPos += 15;
  
  // Table header
  doc.setFillColor(theme.gray900);
  doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(theme.white);
  
  const colX = [margin + 5, margin + 80, margin + 115, margin + 145];
  doc.text('HABIT', colX[0], yPos + 7);
  doc.text('FREQUENCY', colX[1], yPos + 7);
  doc.text('STREAK', colX[2], yPos + 7);
  doc.text('RATE', colX[3], yPos + 7);
  yPos += 12;
  
  // Table rows
  uniqueHabits.forEach((habit, index) => {
    checkNewPage(12);
    
    // Alternating row background
    if (index % 2 === 1) {
      doc.setFillColor(theme.gray50);
      doc.rect(margin, yPos - 1, contentWidth, 10, 'F');
    }
    
    const streak = habit.completed_dates?.length || 0;
    const totalDays = habit.created_at ? 
      Math.ceil((Date.now() - new Date(habit.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 1;
    const rate = totalDays > 0 ? Math.round((streak / totalDays) * 100) : 0;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(theme.gray700);
    
    // Color indicator
    doc.setFillColor(habit.color);
    doc.circle(margin + 2, yPos + 4, 2, 'F');
    
    // Habit name
    const habitName = habit.name.length > 30 ? habit.name.substring(0, 30) + '...' : habit.name;
    doc.text(habitName, colX[0] + 5, yPos + 6);
    
    // Frequency
    doc.text(habit.frequency === 'daily' ? 'Daily' : 'Custom', colX[1], yPos + 6);
    
    // Streak with badge
    doc.setFillColor(streak > 7 ? theme.success : streak > 3 ? theme.warning : theme.gray300);
    doc.roundedRect(colX[2] - 1, yPos + 1.5, 22, 6, 1.5, 1.5, 'F');
    doc.setTextColor(theme.white);
    doc.setFont('helvetica', 'bold');
    doc.text(`${streak}d`, colX[2] + 10, yPos + 6, { align: 'center' });
    
    // Rate
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(theme.gray700);
    doc.text(`${rate}%`, colX[3], yPos + 6);
    
    yPos += 10;
  });
  
  // Table border
  doc.setDrawColor(theme.gray200);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPos - (uniqueHabits.length * 10) - 12, contentWidth, (uniqueHabits.length * 10) + 12, 2, 2, 'S');
  
  addFooter();
  
  // Save PDF
  const fileName = `habit-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};