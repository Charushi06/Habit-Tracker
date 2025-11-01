--In Supabase, we don’t create storage buckets using SQL — we create them through the Dashboard
--if contributor/Admin specifically want to automate it via SQL (for migrations or scripts), here’s how to do it properly using Supabase’s underlying storage.buckets table.
  -- Create a new bucket named 'avatars'
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

--id → the bucket identifier (must be lowercase, unique)
--name → display name
--public → set true to make it publicly readable (recommended for profile images)

--Enable row level security (RLS)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--1. Allow Authenticated Users to Upload to avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

--2. Allow Public Read Access to avatars
CREATE POLICY "Public avatars are viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
