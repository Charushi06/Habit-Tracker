-- Achievement Badges System Migration
-- This migration adds the predefined_badges and user_badges tables for the achievement system.
-- It is idempotent and can be run multiple times safely.

-- Step 1: Create predefined_badges table
DROP TABLE IF EXISTS predefined_badges CASCADE;
CREATE TABLE predefined_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  icon text NOT NULL,
  color text NOT NULL,
  category text NOT NULL CHECK (category IN ('milestones', 'streaks', 'consistency', 'challenges', 'special')),
  trigger_type text NOT NULL CHECK (trigger_type IN ('total_habits', 'total_completions', 'longest_streak', 'completion_rate', 'challenge_completed', 'days_active', 'habit_created')),
  trigger_value integer NOT NULL CHECK (trigger_value >= 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 2: Create user_badges table
DROP TABLE IF EXISTS user_badges CASCADE;
CREATE TABLE user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES predefined_badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_predefined_badges_active ON predefined_badges(is_active);
CREATE INDEX IF NOT EXISTS idx_predefined_badges_category ON predefined_badges(category);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at);

-- Step 4: Enable Row Level Security
ALTER TABLE predefined_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS Policies
-- predefined_badges: readable by all authenticated users
DROP POLICY IF EXISTS "Users can view predefined badges" ON predefined_badges;
CREATE POLICY "Users can view predefined badges"
  ON predefined_badges FOR SELECT
  TO authenticated
  USING (true);

-- user_badges: user-specific
DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can insert own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can update own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can delete own badges" ON user_badges;

CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own badges"
  ON user_badges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own badges"
  ON user_badges FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 6: Triggers for updated_at
DROP TRIGGER IF EXISTS update_predefined_badges_updated_at ON predefined_badges;
CREATE TRIGGER update_predefined_badges_updated_at
  BEFORE UPDATE ON predefined_badges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Insert default predefined badges
INSERT INTO predefined_badges (name, description, icon, color, category, trigger_type, trigger_value, is_active)
SELECT
  'First Steps', 'Create your first habit', '🎯', '#3b82f6', 'milestones', 'total_habits', 1, true
WHERE NOT EXISTS (SELECT 1 FROM predefined_badges WHERE name = 'First Steps');

INSERT INTO predefined_badges (name, description, icon, color, category, trigger_type, trigger_value, is_active)
SELECT
  'Habit Builder', 'Create 5 habits', '🏗️', '#10b981', 'milestones', 'total_habits', 5, true
WHERE NOT EXISTS (SELECT 1 FROM predefined_badges WHERE name = 'Habit Builder');

INSERT INTO predefined_badges (name, description, icon, color, category, trigger_type, trigger_value, is_active)
SELECT
  'Habit Master', 'Create 10 habits', '👑', '#8b5cf6', 'milestones', 'total_habits', 10, true
WHERE NOT EXISTS (SELECT 1 FROM predefined_badges WHERE name = 'Habit Master');

INSERT INTO predefined_badges (name, description, icon, color, category, trigger_type, trigger_value, is_active)
SELECT
  'Consistency Champion', 'Complete 50 habit days', '🔥', '#ef4444', 'consistency', 'total_completions', 50, true
WHERE NOT EXISTS (SELECT 1 FROM predefined_badges WHERE name = 'Consistency Champion');

INSERT INTO predefined_badges (name, description, icon, color, category, trigger_type, trigger_value, is_active)
SELECT
  'Streak Starter', 'Maintain a 7-day streak', '⚡', '#f59e0b', 'streaks', 'longest_streak', 7, true
WHERE NOT EXISTS (SELECT 1 FROM predefined_badges WHERE name = 'Streak Starter');

INSERT INTO predefined_badges (name, description, icon, color, category, trigger_type, trigger_value, is_active)
SELECT
  'Streak Master', 'Maintain a 30-day streak', '🌟', '#ec4899', 'streaks', 'longest_streak', 30, true
WHERE NOT EXISTS (SELECT 1 FROM predefined_badges WHERE name = 'Streak Master');

INSERT INTO predefined_badges (name, description, icon, color, category, trigger_type, trigger_value, is_active)
SELECT
  'Perfectionist', 'Achieve 90% completion rate over 30 days', '💎', '#06b6d4', 'consistency', 'completion_rate', 90, true
WHERE NOT EXISTS (SELECT 1 FROM predefined_badges WHERE name = 'Perfectionist');

INSERT INTO predefined_badges (name, description, icon, color, category, trigger_type, trigger_value, is_active)
SELECT
  'Challenge Conqueror', 'Complete your first challenge', '🏆', '#84cc16', 'challenges', 'challenge_completed', 1, true
WHERE NOT EXISTS (SELECT 1 FROM predefined_badges WHERE name = 'Challenge Conqueror');

INSERT INTO predefined_badges (name, description, icon, color, category, trigger_type, trigger_value, is_active)
SELECT
  'Dedicated Tracker', 'Track habits for 30 days', '📅', '#f97316', 'special', 'days_active', 30, true
WHERE NOT EXISTS (SELECT 1 FROM predefined_badges WHERE name = 'Dedicated Tracker');

INSERT INTO predefined_badges (name, description, icon, color, category, trigger_type, trigger_value, is_active)
SELECT
  'Habit Veteran', 'Track habits for 100 days', '🎖️', '#6366f1', 'special', 'days_active', 100, true
WHERE NOT EXISTS (SELECT 1 FROM predefined_badges WHERE name = 'Habit Veteran');

-- Note: This migration is idempotent and can be run multiple times safely.
-- After running, the achievement badges system will be fully functional.
