-- Challenge System Migration (template_id as plain text, no FK)
-- Idempotent script to set up tables, data, policies, etc.
-- Run once in Supabase SQL editor.
ALTER TABLE public.prebuilt_habits 
DROP COLUMN IF EXISTS is_template CASCADE;

ALTER TABLE public.prebuilt_habits
DROP CONSTRAINT IF EXISTS prebuilt_habits_template_id_key;

-- Step 1: Add template columns to prebuilt_habits table (idempotent)
ALTER TABLE public.prebuilt_habits 
  ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false;
ALTER TABLE public.prebuilt_habits 
  ADD COLUMN IF NOT EXISTS template_id text UNIQUE;

-- Step 2: Update existing default prebuilt habits to be templates (only if not already set)
UPDATE public.prebuilt_habits 
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
      ELSE template_id
    END,
    updated_at = now()
WHERE is_default = true
  AND (is_template IS NULL OR is_template = false OR template_id IS NULL);

-- Step 3: Create or replace prebuilt_challenges table WITHOUT FK on template_id
DROP TABLE IF EXISTS public.prebuilt_challenges CASCADE;
CREATE TABLE public.prebuilt_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  template_id text,  -- plain text, no FK
  duration_days integer NOT NULL CHECK (duration_days >= 1),
  goal_type text NOT NULL CHECK (goal_type IN ('daily_completion', 'total_count')),
  goal_value integer NOT NULL CHECK (goal_value >= 1),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 4: Insert default prebuilt challenges (only if not already present)
INSERT INTO public.prebuilt_challenges (name, description, template_id, duration_days, goal_type, goal_value, is_default)
SELECT 
  '7-Day Workout Streak', 'Complete your workout habit every day for 7 days', 'workout-template', 7, 'daily_completion', 7, true
WHERE NOT EXISTS (SELECT 1 FROM public.prebuilt_challenges WHERE name = '7-Day Workout Streak');

INSERT INTO public.prebuilt_challenges (name, description, template_id, duration_days, goal_type, goal_value, is_default)
SELECT 
  '30-Day Reading Challenge', 'Read for at least 30 minutes daily', 'reading-template', 30, 'daily_completion', 30, true
WHERE NOT EXISTS (SELECT 1 FROM public.prebuilt_challenges WHERE name = '30-Day Reading Challenge');

INSERT INTO public.prebuilt_challenges (name, description, template_id, duration_days, goal_type, goal_value, is_default)
SELECT 
  '21-Day Meditation Journey', 'Meditate daily for 21 days', 'meditation-template', 21, 'daily_completion', 21, true
WHERE NOT EXISTS (SELECT 1 FROM public.prebuilt_challenges WHERE name = '21-Day Meditation Journey');

INSERT INTO public.prebuilt_challenges (name, description, template_id, duration_days, goal_type, goal_value, is_default)
SELECT 
  '14-Day Water Challenge', 'Drink 8 glasses of water daily', 'water-template', 14, 'daily_completion', 14, true
WHERE NOT EXISTS (SELECT 1 FROM public.prebuilt_challenges WHERE name = '14-Day Water Challenge');

INSERT INTO public.prebuilt_challenges (name, description, template_id, duration_days, goal_type, goal_value, is_default)
SELECT 
  '10-Day Pomodoro Sprint', 'Complete 20 Pomodoros in 10 days', NULL, 10, 'total_count', 20, true
WHERE NOT EXISTS (SELECT 1 FROM public.prebuilt_challenges WHERE name = '10-Day Pomodoro Sprint');

-- Step 5: Create or migrate challenges table with linked_habit_id as uuid[]
-- If you intend to preserve existing challenges data, run the migration steps below BEFORE dropping the table.
-- Migration steps (run only if table exists and you want to keep data):
-- ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS linked_habit_id_temp uuid[] DEFAULT NULL;
-- UPDATE public.challenges SET linked_habit_id_temp = ARRAY[linked_habit_id::uuid] WHERE linked_habit_id IS NOT NULL;
-- ALTER TABLE public.challenges DROP COLUMN IF EXISTS linked_habit_id;
-- ALTER TABLE public.challenges RENAME COLUMN linked_habit_id_temp TO linked_habit_id;

-- If you want a clean recreate (drops existing data):
DROP TABLE IF EXISTS public.challenges CASCADE;
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prebuilt_challenge_id uuid REFERENCES public.prebuilt_challenges(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text DEFAULT '',
  linked_habit_id uuid[] NOT NULL DEFAULT '{}',  -- Array of habit IDs
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
CREATE INDEX IF NOT EXISTS idx_challenges_user_status ON public.challenges(user_id, status);
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON public.challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_prebuilt_challenges_default ON public.prebuilt_challenges(is_default);
CREATE INDEX IF NOT EXISTS idx_prebuilt_challenges_template ON public.prebuilt_challenges(template_id);
CREATE INDEX IF NOT EXISTS idx_prebuilt_habits_template ON public.prebuilt_habits(template_id);
CREATE INDEX IF NOT EXISTS idx_challenges_linked_habit_id ON public.challenges USING GIN (linked_habit_id);

-- Step 7: Enable Row Level Security
ALTER TABLE public.prebuilt_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Step 8: RLS Policies for prebuilt_habits (update to allow templates)
DROP POLICY IF EXISTS "Users can view own prebuilt habits" ON public.prebuilt_habits;
CREATE POLICY "Users can view own prebuilt habits and templates"
  ON public.prebuilt_habits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_template = true);

-- Policies for prebuilt_challenges (readable by all authenticated)
DROP POLICY IF EXISTS "Users can view prebuilt challenges" ON public.prebuilt_challenges;
CREATE POLICY "Users can view prebuilt challenges"
  ON public.prebuilt_challenges FOR SELECT
  TO authenticated
  USING (true);

-- Policies for challenges (user-specific)
DROP POLICY IF EXISTS "Users can view own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can insert own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can update own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can delete own challenges" ON public.challenges;

CREATE POLICY "Users can view own challenges"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges"
  ON public.challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
  ON public.challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenges"
  ON public.challenges FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 9: Triggers for updated_at (create helper function if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_prebuilt_challenges_updated_at ON public.prebuilt_challenges;
CREATE TRIGGER update_prebuilt_challenges_updated_at
  BEFORE UPDATE ON public.prebuilt_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_challenges_updated_at ON public.challenges;
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();




-- Alter linked_habit_id to support multiple habits as uuid array
-- This fixes the type mismatch error when inserting arrays

-- 1. Add a new temporary column as uuid array (to preserve data)
ALTER TABLE challenges
ADD COLUMN IF NOT EXISTS linked_habit_id_new uuid[] DEFAULT NULL;

-- 2. Migrate existing data: wrap single UUIDs in arrays
UPDATE challenges
SET linked_habit_id_new = ARRAY[linked_habit_id]
WHERE linked_habit_id IS NOT NULL;

-- 3. Drop the old column
ALTER TABLE challenges
DROP COLUMN IF EXISTS linked_habit_id;

-- 4. Rename the new column to the original name
ALTER TABLE challenges
RENAME COLUMN linked_habit_id_new TO linked_habit_id;

-- 5. Add NOT NULL constraint (assuming all challenges must have at least one habit)
ALTER TABLE challenges
ALTER COLUMN linked_habit_id SET NOT NULL;

-- 6. Update any triggers or functions if needed (none currently reference this specifically)
-- Note: Foreign key reference is removed since arrays don't support direct FK constraints
-- Integrity will be enforced in application code (e.g., validate habit IDs exist before insert)

-- 7. Create index on the array column for performance (e.g., for contains queries)
CREATE INDEX IF NOT EXISTS idx_challenges_linked_habit_id ON challenges USING GIN (linked_habit_id);

-- 8. Update RLS policies if needed (no changes required as they don't reference this column)





-- Incremental Migration: Fix linked_habit_id to uuid array in existing challenges table
-- Run this AFTER the initial 20251101000000_create_complete_challenges_system.sql migration.
-- This assumes the challenges table exists with linked_habit_id as single uuid.
-- It alters the column to uuid[] and migrates existing data.

-- 1. Add a temporary column for the new uuid array
ALTER TABLE challenges
ADD COLUMN IF NOT EXISTS linked_habit_id_temp uuid[] DEFAULT NULL;

-- 2. Migrate existing single UUID data to array format
UPDATE challenges
SET linked_habit_id_temp = ARRAY[linked_habit_id]
WHERE linked_habit_id IS NOT NULL;

-- 3. Drop the old column (this removes the FK constraint automatically)
ALTER TABLE challenges
DROP COLUMN IF EXISTS linked_habit_id;

-- 4. Rename the temp column to the original name
ALTER TABLE challenges
RENAME COLUMN linked_habit_id_temp TO linked_habit_id;

-- 5. Set NOT NULL and default (assuming challenges must have at least one habit)
ALTER TABLE challenges
ALTER COLUMN linked_habit_id SET NOT NULL,
ALTER COLUMN linked_habit_id SET DEFAULT '{}';

-- 6. Add GIN index for efficient array queries (e.g., contains operations)
CREATE INDEX IF NOT EXISTS idx_challenges_linked_habit_id ON challenges USING GIN (linked_habit_id);

-- Note: No FK constraint on arrays; integrity enforced in application code.
-- After running this, the challenges table will support multiple linked habits.
-- Test by creating a challenge with multiple habit IDs.
