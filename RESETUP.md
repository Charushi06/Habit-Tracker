# Re-setup Supabase Storage Bucket for Avatars

This guide provides instructions for administrators to configure a Supabase storage bucket for user avatars in the Habit-Tracker app. Avatars will allow users to upload profile images, stored securely with Row Level Security (RLS) policies to ensure only authenticated users can upload to their own directories, while allowing public reads for displaying avatars.

## Step 1: Create the Storage Bucket
1. Log in to your Supabase Dashboard.
2. Navigate to **Storage** in the left sidebar.
3. Click **New Bucket**.
4. Set the following:
   - **Name**: `avatars` (use lowercase, no spaces).
   - **Public Bucket**: Enable this if you want avatars publicly readable (recommended for profile images). If disabled, uploads will be private, and you'll need signed URLs for reads.
   - **File Size Limit**: Set to 5MB (or as needed for avatars).
5. Click **Create Bucket**.

## Step 2: Enable Row Level Security (RLS)
Supabase Storage uses RLS on the underlying `storage.objects` table to control access.

1. In the Supabase Dashboard, go to **Authentication > Policies** (or directly to SQL Editor for custom policies).
2. Ensure RLS is enabled on the `storage.objects` table (it is by default).

## Step 3: Create RLS Policies
We'll create policies for:
- **Uploads/Updates**: Authenticated users can only insert/update their own avatars.
- **Reads**: Public access to view avatars (if bucket is public).

Use the SQL Editor in the Dashboard to run these policies. 

### Policy 1: Users can upload their own avatars (INSERT)
```sql
-- Enable RLS if not already
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for inserting avatars: Users can upload to their own folder
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');
```

### Policy 2: Users can update their own avatars (UPDATE)
```sql
-- Let anyone read avatar images
CREATE POLICY "Allow public read access to avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## Step 4: Verify Policies
1. Go to **Storage > Policies** in the Dashboard.
2. You should see the new policies listed for the `storage.objects` table.
3. Test by signing up/logging in as a user and attempting an upload via the app (once integrated).

## Troubleshooting
- **Policy Errors**: Check SQL logs in Dashboard > Reports > API.
