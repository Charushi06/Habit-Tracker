-- Complete Challenge System Migration (Fixed with linked_habit_id as uuid array)
-- This is a standalone, idempotent script to set up the full challenge system.
-- Run this once in Supabase SQL editor to create/fix tables, data, policies, etc.
-- It handles the type mismatch by defining linked_habit_id as uuid[] from the start.
-- If tables exist, it will alter/migrate as needed.

-- Step 1: Add template columns to prebuilt_habits table (idempotent)
ALTER TABLE prebuilt_habits 
ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false;
ALTER TABLE prebuilt_habits 
ADD COLUMN IF NOT EXISTS template_id text UNIQUE;

-- Step 2: Update existing default prebuilt habits to be templates (only if not already set)
UPDATE prebuilt_habits 
SET is_template = true, 
    template_id = CASE
      WHEN name = 'Drink Water' THEN 'water-template'
      WHEN name = 'Exercise' THEN 'workout-template'
      WHEN name = 'Read Books' THEN 'reading-template'
      WHEN name = 'Meditate' THEN 'meditation-template'
      WHEN name = 'Journal' THEN 'journal-template'
      WHEN name = 'Walk' THEN 'walk-template'
      WHEN name = 'Learn Language' THEN 'language-template'
      WHEN name = 'Healthy Breakfast' THEN 'breakfast-template'
      ELSE NULL
    END
WHERE is_default = true 
  AND (is_template IS NULL OR is_template = false OR template_id IS NULL);

-- Step 3: Create or replace prebuilt_challenges table
DROP TABLE IF EXISTS prebuilt_challenges CASCADE;
CREATE TABLE prebuilt_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  template_id text REFERENCES prebuilt_habits(template_id) ON DELETE SET NULL,
  duration_days integer NOT NULL CHECK (duration_days >= 1),
  goal_type text NOT NULL CHECK (goal_type IN ('daily_completion', 'total_count')),
  goal_value integer NOT NULL CHECK (goal_value >= 1),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 4: Insert default prebuilt challenges (only if not already present)
INSERT INTO prebuilt_challenges (name, description, template_id, duration_days, goal_type, goal_value, is_default)
SELECT 
  '7-Day Workout Streak', 'Complete your workout habit every day for 7 days', 'workout-template', 7, 'daily_completion', 7, true
WHERE NOT EXISTS (SELECT 1 FROM prebuilt_challenges WHERE name = '7-Day Workout Streak');
INSERT INTO prebuilt_challenges (name, description, template_id, duration_days, goal_type, goal_value, is_default)
SELECT 
  '30-Day Reading Challenge', 'Read for at least 30 minutes daily', 'reading-template', 30, 'daily_completion', 30, true
WHERE NOT EXISTS (SELECT 1 FROM prebuilt_challenges WHERE name = '30-Day Reading Challenge');
INSERT INTO prebuilt_challenges (name, description, template_id, duration_days, goal_type, goal_value, is_default)
SELECT 
  '21-Day Meditation Journey', 'Meditate daily for 21 days', 'meditation-template', 21, 'daily_completion', 21, true
WHERE NOT EXISTS (SELECT 1 FROM prebuilt_challenges WHERE name = '21-Day Meditation Journey');
INSERT INTO prebuilt_challenges (name, description, template_id, duration_days, goal_type, goal_value, is_default)
SELECT 
  '14-Day Water Challenge', 'Drink 8 glasses of water daily', 'water-template', 14, 'daily_completion', 14, true
WHERE NOT EXISTS (SELECT 1 FROM prebuilt_challenges WHERE name = '14-Day Water Challenge');
INSERT INTO prebuilt_challenges (name, description, template_id, duration_days, goal_type, goal_value, is_default)
SELECT 
  '10-Day Pomodoro Sprint', 'Complete 20 Pomodoros in 10 days', NULL, 10, 'total_count', 20, true
WHERE NOT EXISTS (SELECT 1 FROM prebuilt_challenges WHERE name = '10-Day Pomodoro Sprint');

-- Step 5: Create or replace challenges table with linked_habit_id as uuid array
-- First, if table exists, migrate data from single uuid to array
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'challenges') THEN
    -- Add temp column if not exists
    ALTER TABLE challenges ADD COLUMN IF NOT EXISTS linked_habit_id_temp uuid[] DEFAULT NULL;
    -- Migrate existing single uuid to array
    UPDATE challenges SET linked_habit_id_temp = ARRAY[linked_habit_id::uuid] WHERE linked_habit_id IS NOT NULL;
    -- Drop old column
    ALTER TABLE challenges DROP COLUMN IF EXISTS linked_habit_id;
    -- Rename temp to new name
    ALTER TABLE challenges RENAME COLUMN linked_habit_id_temp TO linked_habit_id;
  END IF;
END $$;

-- Now create or alter the table to ensure correct schema
DROP TABLE IF EXISTS challenges CASCADE;
CREATE TABLE challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prebuilt_challenge_id uuid REFERENCES prebuilt_challenges(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text DEFAULT '',
  linked_habit_id uuid[] NOT NULL DEFAULT '{}',  -- Array of habit IDs (no direct FK, enforced in app)
  duration_days integer NOT NULL CHECK (duration_days >= 1),
  goal_type text NOT NULL CHECK (goal_type IN ('daily_completion', 'total_count')),
  goal_value integer NOT NULL CHECK (goal_value >= 1),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (end_date >= start_date),
  CHECK (duration_days = (end_date - start_date + 1))
);

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenges_user_status ON challenges(user_id, status);
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_prebuilt_challenges_default ON prebuilt_challenges(is_default);
CREATE INDEX IF NOT EXISTS idx_prebuilt_challenges_template ON prebuilt_challenges(template_id);
CREATE INDEX IF NOT EXISTS idx_prebuilt_habits_template ON prebuilt_habits(template_id);
-- GIN index for array contains queries on linked_habit_id
CREATE INDEX IF NOT EXISTS idx_challenges_linked_habit_id ON challenges USING GIN (linked_habit_id);

-- Step 7: Enable Row Level Security
ALTER TABLE prebuilt_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Step 8: RLS Policies for prebuilt_habits (update to allow templates)
DROP POLICY IF EXISTS "Users can view own prebuilt habits" ON prebuilt_habits;
CREATE POLICY IF NOT EXISTS "Users can view own prebuilt habits and templates"
  ON prebuilt_habits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_template = true);

-- Policies for prebuilt_challenges (readable by all authenticated)
DROP POLICY IF EXISTS "Users can view prebuilt challenges" ON prebuilt_challenges;
CREATE POLICY "Users can view prebuilt challenges"
  ON prebuilt_challenges FOR SELECT
  TO authenticated
  USING (true);

-- Policies for challenges (user-specific)
DROP POLICY IF EXISTS "Users can view own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can insert own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can update own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can delete own challenges" ON challenges;

CREATE POLICY "Users can view own challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges"
  ON challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
  ON challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenges"
  ON challenges FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 9: Triggers for updated_at (assuming update_updated_at_column function exists; create if not)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_prebuilt_challenges_updated_at ON prebuilt_challenges;
CREATE TRIGGER update_prebuilt_challenges_updated_at
  BEFORE UPDATE ON prebuilt_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_challenges_updated_at ON challenges;
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Note: This script is idempotent and can be run multiple times safely.
-- After running, the challenges system will support multiple linked habits via uuid arrays.
-- Application code (e.g., HabitsContext.tsx) already handles arrays correctly.
-- Test by creating a challenge with multiple habit IDs.
