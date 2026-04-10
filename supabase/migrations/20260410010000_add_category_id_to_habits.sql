/*
  # Add category_id to habits table

  1. Changes
    - Add `category_id` column to `habits` table as a foreign key to `categories`.
    - `category_id` is nullable because a habit might not belong to a managed category.
    - Set up foreign key constraint with `ON DELETE SET NULL`.

  2. Security
    - No changes to RLS needed as `category_id` is just a reference.
*/

-- Add category_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'habits'
      AND column_name = 'category_id'
  ) THEN
    ALTER TABLE habits
    ADD COLUMN category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_habits_category_id ON habits(category_id);

-- Update history tracking functions to handle the category_id field correctly

-- Re-create function to log habit creation (with category_id)
CREATE OR REPLACE FUNCTION log_habit_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO habit_history (habit_id, user_id, habit_name, action, changes)
  VALUES (
    NEW.id,
    NEW.user_id,
    NEW.name,
    'created',
    jsonb_build_object(
      'description', NEW.description,
      'color', NEW.color,
      'icon', NEW.icon,
      'frequency', NEW.frequency,
      'target_days', NEW.target_days,
      'active_days', NEW.active_days,
      'category', NEW.category,
      'category_id', NEW.category_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create function to log habit updates (with category_id)
CREATE OR REPLACE FUNCTION log_habit_update()
RETURNS TRIGGER AS $$
DECLARE
  changes_obj jsonb := '{}';
BEGIN
  IF NEW.is_active = true THEN
    IF OLD.name != NEW.name THEN
      changes_obj := jsonb_set(changes_obj, '{name}', jsonb_build_object('old', OLD.name, 'new', NEW.name));
    END IF;
    IF OLD.description != NEW.description THEN
      changes_obj := jsonb_set(changes_obj, '{description}', jsonb_build_object('old', OLD.description, 'new', NEW.description));
    END IF;
    IF OLD.color != NEW.color THEN
      changes_obj := jsonb_set(changes_obj, '{color}', jsonb_build_object('old', OLD.color, 'new', NEW.color));
    END IF;
    IF OLD.icon != NEW.icon THEN
      changes_obj := jsonb_set(changes_obj, '{icon}', jsonb_build_object('old', OLD.icon, 'new', NEW.icon));
    END IF;
    IF OLD.frequency != NEW.frequency THEN
      changes_obj := jsonb_set(changes_obj, '{frequency}', jsonb_build_object('old', OLD.frequency, 'new', NEW.frequency));
    END IF;
    IF OLD.target_days != NEW.target_days THEN
      changes_obj := jsonb_set(changes_obj, '{target_days}', jsonb_build_object('old', OLD.target_days, 'new', NEW.target_days));
    END IF;
    IF OLD.active_days != NEW.active_days THEN
      changes_obj := jsonb_set(changes_obj, '{active_days}', jsonb_build_object('old', OLD.active_days, 'new', NEW.active_days));
    END IF;
    IF OLD.category != NEW.category THEN
      changes_obj := jsonb_set(changes_obj, '{category}', jsonb_build_object('old', OLD.category, 'new', NEW.category));
    END IF;
    IF OLD.category_id IS DISTINCT FROM NEW.category_id THEN
      changes_obj := jsonb_set(changes_obj, '{category_id}', jsonb_build_object('old', OLD.category_id, 'new', NEW.category_id));
    END IF;

    IF changes_obj != '{}' THEN
      INSERT INTO habit_history (habit_id, user_id, habit_name, action, changes)
      VALUES (NEW.id, NEW.user_id, NEW.name, 'updated', changes_obj);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create function to log habit deletion (with category_id)
CREATE OR REPLACE FUNCTION log_habit_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_active = true AND NEW.is_active = false THEN
    INSERT INTO habit_history (habit_id, user_id, habit_name, action, changes)
    VALUES (
      OLD.id,
      OLD.user_id,
      OLD.name,
      'deleted',
      jsonb_build_object(
        'description', OLD.description,
        'color', OLD.color,
        'icon', OLD.icon,
        'frequency', OLD.frequency,
        'target_days', OLD.target_days,
        'active_days', OLD.active_days,
        'category', OLD.category,
        'category_id', OLD.category_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
