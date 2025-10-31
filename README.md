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
- [Database Setup](#database-setup)
  - [Running Migrations](#running-migrations)
- [Development](#development)
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

## �️ Database Setup

### Understanding the Database Schema

The application uses three main tables:

- **`profiles`** - User information (name, email, preferences)
- **`habits`** - Habit definitions (name, icon, color, frequency, reminders)
- **`habit_completions`** - Daily completion tracking
- **`habit_history`** - Audit log of all habit changes (create, update, delete)

All tables have Row-Level Security (RLS) policies to ensure users can only access their own data.

### Running Migrations

**⚠️ IMPORTANT:** Migrations must be run in order when setting up the database.

#### Method 1: Using Supabase SQL Editor

1. **Open SQL Editor:**
   - Go to your Supabase Dashboard
   - Navigate to SQL Editor in the left sidebar

2. **Run migrations in order:**

   **Migration 1:** Base Schema (Profiles, Habits, Completions)
   ```bash
   supabase/migrations/20251021073119_create_habit_tracker_schema.sql
   ```
   - Copy the entire file content
   - Paste into SQL Editor
   - Click "Run" (bottom right)
   - Verify success message

   **Migration 2:** Reminders and Snooze Features
   ```bash
   supabase/migrations/20251027000000_complete_habit_reminder_and_snooze_fields.sql
   ```
   - Repeat the same process

   **Migration 3:** History Tracking
   ```bash
   supabase/migrations/20251029000000_add_habit_history_table.sql
   ```
   - Repeat the same process

3. **Verify migrations:**
   - Go to Table Editor
   - Confirm all tables exist: `profiles`, `habits`, `habit_completions`, `habit_history`
   - Check Database → Functions for triggers

#### Method 2: Using Supabase CLI (For Development)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link to your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Run all migrations:**
   ```bash
   supabase db push
   ```

#### Migration Checklist

After running migrations, verify:
- ✅ All tables created: `profiles`, `habits`, `habit_completions`, `habit_history`
- ✅ RLS policies enabled on all tables
- ✅ Triggers created: `habit_creation_trigger`, `habit_update_trigger`, `habit_deletion_trigger`
- ✅ Indexes created for performance

### Monitoring

#### Database Health

1. **Check Table Editor:**
   - Verify data is being stored correctly
   - Monitor table sizes

2. **Review Logs:**
   - Database → Logs
   - Check for errors or slow queries

3. **Monitor API Usage:**
   - Settings → Usage
   - Track API requests, database size, bandwidth

#### Application Monitoring

1. **Netlify Analytics:**
   - View deployment history
   - Monitor build times
   - Check error logs

2. **User Feedback:**
   - Monitor issues on GitHub
   - Check for reported bugs

#### Security Checklist

- ✅ RLS policies enabled on all tables
- ✅ Anon key used in frontend (never use service_role key)
- ✅ Environment variables properly configured
- ✅ HTTPS enabled on deployed site
- ✅ Database backups configured (automatic in Supabase)

#### Adding a New Migration

When a contributor adds a new feature requiring database changes:

1. **Review the migration SQL file** in `supabase/migrations/`
2. **Test in development** first
3. **Run in production** using SQL Editor
4. **Verify** the changes work correctly
5. **Document** any breaking changes

#### Rolling Back Changes

If a deployment causes issues:

1. **Netlify:** Click "Rollback to this deploy" on previous working deployment
2. **Database:** Restore from Supabase automatic backups (Settings → Database → Backups)

#### Updating Environment Variables

1. **Netlify:** Site settings → Environment variables → Edit
2. **Vercel:** Project settings → Environment Variables → Edit
3. **Trigger redeploy** after changing variables

---

## Development

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

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

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

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)
- Deployed on [Netlify](https://www.netlify.com/)

---

**Made with ❤️ by the open-source community**
