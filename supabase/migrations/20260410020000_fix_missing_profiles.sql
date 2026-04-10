-- Fix missing profiles for existing auth users
INSERT INTO public.profiles (id, email, full_name, theme)
SELECT id, email, '', 'light'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Create an automatic trigger to ensure new auth users ALWAYS get a profile
-- This prevents the "missing profile" 409 Foreign Key Violation bug forever.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, theme)
  VALUES (new.id, new.email, '', 'light')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists just in case
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
