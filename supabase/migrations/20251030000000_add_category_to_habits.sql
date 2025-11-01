-- Add category column to habits table
ALTER TABLE habits
ADD COLUMN category TEXT DEFAULT 'General' NOT NULL;

COMMENT ON COLUMN habits.category IS 'Category for grouping habits (e.g., Health, Work)';

-- ---
-- Update history tracking functions to include the new 'category' field
-- This ensures habit history correctly logs category changes.
-- ---

-- Re-create function to log habit creation (with category)
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
      'category', NEW.category -- Added category
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create function to log habit updates (with category)
CREATE OR REPLACE FUNCTION log_habit_update()
RETURNS TRIGGER AS $$
DECLARE
  changes_obj jsonb := '{}';
BEGIN
  -- Only log if is_active is still true (not a soft delete)
  IF NEW.is_active = true THEN
    -- Build changes object for modified fields
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
    -- Add category change tracking
    IF OLD.category != NEW.category THEN
      changes_obj := jsonb_set(changes_obj, '{category}', jsonb_build_object('old', OLD.category, 'new', NEW.category));
    END IF;

    -- Only insert if there are actual changes
    IF changes_obj != '{}' THEN
      INSERT INTO habit_history (habit_id, user_id, habit_name, action, changes)
      VALUES (NEW.id, NEW.user_id, NEW.name, 'updated', changes_obj);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create function to log habit deletion (with category)
CREATE OR REPLACE FUNCTION log_habit_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if is_active changed from true to false (soft delete)
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
        'category', OLD.category -- Added category
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;