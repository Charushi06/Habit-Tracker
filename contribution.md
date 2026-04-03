## 1. Project Overview

### Description
Habit Tracker is a modern, open-source habit tracker built with React, TypeScript, Vite, and Tailwind CSS, with Supabase backend. Track your daily habits, visualize your progress through calendar views, monitor your history, and build better routines with intelligent reminders.

### Tech Stack
- **Frontend:** React, TypeScript, Vite, and Tailwind CSS
- **Backend:** Supabase
- **Database:** Supabase

### Current Features
Habit Tracker currently supports:
  
 - User Authentication & Authorization – Secure login/signup using Supabase Auth
 - Create, Edit & Delete Habits – Full CRUD operations with intuitive UI
 - Daily Habit Tracking – Mark habits complete with a single click
 - Progress Visualization – Track streaks and completion stats
 - Calendar View – Monthly overview of habit completion
 - History Timeline – Logs all habit changes (create/update/delete)
 - Search & Filter – Quickly find habits and history entries

### Target Users
This project is built for students, professionals, fitness enthusiasts and self-improvement users.

## 2. Architecture / Key Modules

- Authentication Module:	src/components/Auth.tsx, src/contexts/AuthContext.tsx
- Habit Management:	src/components/HabitForm.tsx, src/contexts/HabitsContext.tsx
- Dashboard:	src/components/Dashboard.tsx
- Progress & Analytics:	src/components/ProgressView.tsx
- Calendar View:	src/components/CalendarView.tsx
- History & Logs:	src/components/HistoryView.tsx
- Theme System:	src/contexts/ThemeContext.tsx
- Supabase Client:	src/lib/
- Database Layer:	supabase/migrations/

---
### Module Overview

| Module/Component | Location | Purpose |
|------------------|----------|---------|
| **Frontend (React + TypeScript)** | `frontend/src/` | Handles all user-facing UI components, pages, and interactions. Manages state and user input. |
| **Build Tool (Vite)** | `/` | Bundles and optimizes the frontend application for development and production. |
| **Styling (Tailwind CSS)** | `frontend/src/styles/` | Provides utility-first styling for UI components and responsive design. |
| **Backend (Supabase + API Routes)** | `backend/` | Handles authentication, API endpoints, server-side logic, and integration with the database. |
| **Database (PostgreSQL)** | `supabase/` | Stores all persistent data, including users, habits, achievements, and community posts. |
| **Icons (Lucide React)** | `frontend/src/components/icons/` | Provides vector icons for UI elements across the frontend. |
| **Deployment (Netlify)** | `/` | Hosts the frontend application and serves it to users with continuous deployment. |

---

### Architecture
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
---
## 3. New Feature Ideas

### Feature 1: Habit Completion Sharing (Community & Social Features)

**Problem it solves:** Users cannot share their habit progress or achievements with others, reducing engagement and social motivation.

**Example:** Users can post streaks, milestones, or completed habits to a community feed for encouragement and accountability.

- **Difficulty Level:** Medium
- **Estimated Effort:** 12-16 hours
- **Modules Affected:**
  - `frontend/src/components/HabitFeed.js` - Display shared habits
  - `frontend/src/components/ShareButton.js` - UI for sharing habits
  - `backend/routes/habitShare.js` - API for posting and fetching shared habits
  - `backend/controllers/habitShareController.js` - Logic for sharing habits and fetching feed

---

### Feature 2: Achievement Badges System

**Problem it solves:** Users lack gamification incentives to stay consistent with habits.

**Example:** Award badges for milestones like "7-day streak", "Complete 10 habits", or "Consistency Champion."

- **Difficulty Level:** Medium
- **Estimated Effort:** 10-14 hours
- **Modules Affected:**
  - `frontend/src/components/BadgeDisplay.js` - UI for showing earned badges
  - `frontend/src/pages/Profile.js` - Add badge section
  - `backend/models/Badge.js` - Badge schema
  - `backend/controllers/badgeController.js` - Badge assignment logic

---

### Feature 3: Landing Page Before Login/Signup

**Problem it solves:** First-time visitors have no introduction to the app features before creating an account.

**Example:** A marketing/landing page highlighting habit tracking, community sharing, and achievements.

- **Difficulty Level:** Beginner
- **Estimated Effort:** 6-8 hours
- **Modules Affected:**
  - `frontend/src/pages/LandingPage.js` - Landing page component
  - `frontend/src/App.js` - Add route before login
  - `frontend/src/styles/landing.css` - Custom styling for landing page

---

### Feature 4: Avatar Upload Fix & Profile Customization

**Problem it solves:** Users cannot upload avatars, affecting personalization.

**Example:** Users can select or upload profile pictures to personalize their account.

- **Difficulty Level:** Intermediate
- **Estimated Effort:** 8-12 hours
- **Modules Affected:**
  - `frontend/src/components/ProfileAvatar.js` - UI for avatar upload
  - `backend/routes/profile.js` - Endpoint for avatar upload
  - `backend/controllers/profileController.js` - Handle file upload, validation, and storage

---

### Feature 5: Pre-built Habit Bundles (Quick Setup)

**Problem it solves:** New users spend time manually creating habits; onboarding is slow.

**Example:** Offer ready-made sets like "Morning Routine," "Fitness Goals," or "Study Plan" for quick adoption.

- **Difficulty Level:** Beginner
- **Estimated Effort:** 6-10 hours
- **Modules Affected:**
  - `frontend/src/components/HabitBundle.js` - UI for selecting bundles
  - `backend/controllers/bundleController.js` - Logic for fetching and adding bundles
  - `backend/models/HabitBundle.js` - Predefined habit sets

---

### Feature 6: Reward Pop-ups / Empty State UI

**Problem it solves:** Users lack immediate feedback for completing habits or seeing empty dashboards.

**Example:** Display a congratulatory pop-up on habit completion or show friendly messaging on empty habit lists.

- **Difficulty Level:** Beginner
- **Estimated Effort:** 4-6 hours
- **Modules Affected:**
  - `frontend/src/components/RewardPopup.js` - Pop-up component
  - `frontend/src/components/EmptyState.js` - Component for empty dashboards
  - `frontend/src/pages/Dashboard.js` - Trigger pop-up or empty state conditionally

---

## 4. Feature Implementation Pipeline

### Pipeline for Feature 1: Habit Completion Sharing

1. **Design Database Schema**
   - `shared_habits` table: `id`, `user_id`, `habit_id`, `message`, `created_at`

2. **Create Backend Endpoints**
   - `POST /api/habit/share` - Share habit
   - `GET /api/habit/feed` - Fetch community feed

3. **Build Frontend Feed Component**
   - Display list of shared habits
   - Include user info, habit details, and timestamps

4. **Add Share Button**
   - Trigger API call to share habit
   - Include optional message or emoji

5. **Testing**
   - Verify API endpoints
   - Ensure feed updates in real-time or on refresh
   - Test mobile responsiveness

---

### Pipeline for Feature 2: Achievement Badges System

1. **Define Badge Criteria**
   - Example: streaks, number of habits completed, special challenges

2. **Backend Badge Assignment**
   - Add badge logic in `badgeController.js`
   - Assign badges when criteria are met

3. **Frontend Badge Display**
   - Component to show badges on dashboard or profile
   - Optional animation or tooltip with description

4. **Testing**
   - Simulate badge triggers
   - Verify correct badges are assigned
   - Confirm display on profile page

---

### Pipeline for Feature 3: Landing Page Before Login/Signup

1. **Create Landing Page Component**
   - Include marketing copy, screenshots, CTA buttons

2. **Add Routing**
   - Route `/` or `/home` before authentication

3. **Styling**
   - Use Tailwind CSS for responsive layout
   - Ensure accessible fonts, colors, and spacing

4. **Testing**
   - Verify navigation to login/signup
   - Test on desktop and mobile layouts

---

### Pipeline for Feature 4: Avatar Upload Fix & Profile Customization

1. **Fix Backend Upload**
   - Ensure file validation (size/type)
   - Save to cloud storage (Supabase Storage or local)

2. **Update Frontend**
   - Add image preview
   - Handle errors and success feedback

3. **Testing**
   - Upload different image sizes and formats
   - Confirm storage and retrieval work correctly

---

### Pipeline for Feature 5: Pre-built Habit Bundles

1. **Define Bundles**
   - Create JSON or DB entries for each bundle

2. **Backend Endpoint**
   - `GET /api/bundles` - Fetch available bundles
   - `POST /api/bundles/add` - Add selected bundle to user habits

3. **Frontend Integration**
   - Display bundle cards with descriptions
   - Allow selection and addition to user dashboard

4. **Testing**
   - Verify bundles appear
   - Confirm habits are added correctly

---

### Pipeline for Feature 6: Reward Pop-ups / Empty State UI

1. **Create Components**
   - `RewardPopup.js` with animations
   - `EmptyState.js` for empty dashboards

2. **Trigger Conditions**
   - Habit completion triggers pop-up
   - Empty habit list triggers empty state

3. **Frontend Styling**
   - Tailwind CSS animations and responsive layout

4. **Testing**
   - Ensure pop-ups appear at correct times
   - Test edge cases (rapid habit completion, empty dashboard)

---

## 5. Good First Issues

### Issue 1: Add Loading Spinner to Login Button

- Add visual feedback while authentication request is processing
- Files: `frontend/src/components/LoginForm.js`, `frontend/src/components/Spinner.js`
- Steps:
  1. Add `loading` state
  2. Show spinner inside button during request
  3. Reset after response

---

### Issue 2: Add Input Validation Messages

- Display user-friendly messages for invalid inputs
- Files: `frontend/src/components/Form.js`, `frontend/src/utils/validation.js`
- Requirements:
  - Email: "Please enter a valid email address"
  - Password: "Password must be at least 8 characters"
  - Username: "Username must be 3-20 characters"

---

### Issue 3: Improve README Documentation

- Add Windows setup instructions and env variable table
- Files: `README.md`, optional `docs/SETUP.md`
- Steps:
  1. Document installation steps
  2. Explain environment variables
  3. Include troubleshooting tips

---

### Issue 4: Add Favicon and Page Title

- Files: `frontend/public/index.html`, `frontend/src/App.js`
- Steps:
  1. Add favicon file
  2. Update `<link rel="icon">` and dynamic page titles

---

### Issue 5: Add "Copy to Clipboard" Button

- Files: `frontend/src/components/[ComponentName].js`, `frontend/src/utils/clipboard.js`
- Steps:
  1. Button shows "Copy" by default
  2. Changes to "Copied!" for 2 seconds after click
  3. Works across modern browsers

---

## 6. Contributor Notes

### Getting Started

#### Prerequisites
Make sure you have the following installed:
Node.js v16+
npm or yarn
Supabase account

#### Setup Steps

1. **Fork and Clone the Repository**
   ```bash
    git clone https://github.com/Charushi06/Habit-Tracker.git
    cd Habit-Tracker
    npm install
   ```
2. Environment Variables

Create .env:
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```
3. Run App
```
npm run dev
```

Visit: http://localhost:5173

### Important Libraries & Tools

## Module Overview

| Module/Component | Purpose |
|------------------|---------|
| React + TypeScript | Frontend |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Supabase | Backend + Database (Auth, APIs, Realtime) |
| PostgreSQL | Database |
| Lucide React | Icons |
| Netlify | Deployment |

---

### Tips for Beginners

1. **Start Small**  
   Pick a "Good First Issue" to get familiar with the codebase before tackling larger features.

2. **Read Existing Code**  
   Before adding a new feature, find similar existing functionality and use it as a reference.

3. **Ask Questions**  
   Don't hesitate to ask in [Discord/Slack/Issues]. We're here to help!

4. **Follow Code Style**  
   - We use [Prettier/ESLint/Black] for code formatting
   - Run `npm run lint` before committing
   - Follow existing naming conventions

5. **Write Tests**  
   Add tests for new features when possible. Check the `/tests` folder for examples.

6. **Commit Message Format**  
   ```
   type: brief description
   
   - More details if needed
   - What changed and why
   ```
   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

7. **Pull Request Guidelines**  
   - Link the related issue
   - Describe what changed and why
   - Add screenshots for UI changes
   - Make sure all tests pass

8. **Development Workflow**
   ```bash
   # Create a feature branch
   git checkout -b feature/your-feature-name
   
   # Make your changes
   # ...
   
   # Test your changes
   npm test
   
   # Commit with clear message
   git add .
   git commit -m "feat: add dark mode toggle"
   
   # Push to your fork
   git push origin feature/your-feature-name
   
   # Open Pull Request on GitHub
   ```

---

### Common Issues & Solutions

**Issue:** Database connection fails  
**Solution:** Check that PostgreSQL/MongoDB is running and environment variables are correct

**Issue:** Port already in use  
**Solution:** Change `PORT` in `.env` or kill the process using `lsof -ti:3000 | xargs kill`

**Issue:** Module not found errors  
**Solution:** Delete `node_modules` and run `npm install` again

---

### Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We're committed to providing a welcoming and inclusive environment for all contributors.

---

### Need Help?

- Check the [full documentation](docs/)
- Report bugs via [GitHub Issues]
- Email/phone number/discord handle: [maintainer@email.com]

---

**Happy Contributing!**

We appreciate your interest in making this project better. Every contribution, no matter how small, makes a difference!
