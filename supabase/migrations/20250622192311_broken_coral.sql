/*
  # Create avatar storage bucket and policies

  1. Storage Setup
    - Create 'avatars' bucket for user profile pictures
    - Set bucket to public for easy access to profile images

  2. Security Policies
    - Allow authenticated users to upload their own avatars
    - Allow authenticated users to update/delete their own avatars
    - Allow public read access to all avatars (for profile visibility)

  3. File Naming Convention
    - Files must be named with user ID prefix: "avatars/{user_id}-{timestamp}.{ext}"
*/

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies on storage.objects table using standard CREATE POLICY syntax
-- Note: We need to use the storage schema and proper table references

-- Policy to allow authenticated users to upload their own avatars
CREATE POLICY "authenticated_users_upload_own_avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = (storage.filename(name) ~ '^([a-f0-9-]+)-.*'::text)::text
);

-- Policy to allow authenticated users to view all avatars (needed for profile pictures)
CREATE POLICY "authenticated_users_view_avatars" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

-- Policy to allow authenticated users to update their own avatars
CREATE POLICY "authenticated_users_update_own_avatars" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = (storage.filename(name) ~ '^([a-f0-9-]+)-.*'::text)::text
);

-- Policy to allow authenticated users to delete their own avatars
CREATE POLICY "authenticated_users_delete_own_avatars" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = (storage.filename(name) ~ '^([a-f0-9-]+)-.*'::text)::text
);

-- Policy to allow public read access to avatars (for anonymous users viewing profiles)
CREATE POLICY "public_read_avatars" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');