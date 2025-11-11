# Habit Tracker Web App

A modern, open-source habit tracker built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**, with **Supabase** backend. Track your daily habits, visualize your progress through calendar views, monitor your history, and build better routines with intelligent reminders.

---

## 🚀 Features

### Core Functionality
- ✅ **Create, Edit & Delete Habits** - Full CRUD operations with intuitive UI
- 📅 **Daily Habit Tracking** - Mark habits as complete with a single click
- 📊 **Progress Visualization** - View completion stats and streaks
- 📆 **Calendar View** - See your habit completion history month by month
- 📜 **History Timeline** - Track all changes (created, updated, deleted) with detailed logs
- 🔍 **Search & Filter** - Find habits quickly in your history

### User Experience
- 🌙 **Dark & Light Mode** - Toggle between themes with persistent preference
- 🔔 **Smart Reminders** - Browser and email notifications at custom times
- ⏰ **Flexible Scheduling** - Daily or custom weekday frequencies
- 🎨 **Customizable Habits** - Choose from emojis and colors
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### Backend & Security
- 🔐 **Supabase Authentication** - Secure user accounts with email/password
- ☁️ **Cloud Sync** - All data synchronized in real-time
- 🔒 **Row-Level Security** - Your data is protected and private
- 🗄️ **PostgreSQL Database** - Reliable data storage with automatic backups
- 🔄 **Automatic History Tracking** - Database triggers log all habit changes

---

## 🌐 Live Demo

**Deployed Application:** https://habittracker-c.netlify.app/

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Project Structure](#project-structure)
  - [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Supabase Account** (for backend functionality)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Charushi06/Habit-Tracker.git
   cd Habit-Tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Environment Setup

1. **Create a `.env` file** in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Get your Supabase credentials:**
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Select your project
   - Navigate to Settings → API
   - Copy the `Project URL` and `anon/public` key

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser** and visit `http://localhost:5173`

---

### Project Structure

```
Habit-Tracker/
├── src/
│   ├── components/        # React components
│   │   ├── Auth.tsx      # Authentication UI
│   │   ├── Dashboard.tsx # Main dashboard
│   │   ├── HabitForm.tsx # Create/Edit habits
│   │   ├── CalendarView.tsx
│   │   ├── HistoryView.tsx
│   │   └── ProgressView.tsx
│   ├── contexts/         # React context providers
│   │   ├── AuthContext.tsx
│   │   ├── HabitsContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Supabase client
│   ├── utils/           # Utility functions
│   └── main.tsx         # App entry point
├── supabase/
│   └── migrations/      # Database migrations
├── public/              # Static assets
└── package.json
```

### Scripts

- `npm run dev` - Start development server

### Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Icons:** Lucide React
- **Deployment:** Netlify

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/your-feature-name`
3. **Commit your changes:** `git commit -m 'Add some feature'`
4. **Push to the branch:** `git push origin feature/your-feature-name`
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Write clear commit messages
- Update documentation if needed
- Test your changes thoroughly
- Include migration files for database changes

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Acknowledgments

- Built with [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)
- Deployed on [Netlify](https://www.netlify.com/)

---

