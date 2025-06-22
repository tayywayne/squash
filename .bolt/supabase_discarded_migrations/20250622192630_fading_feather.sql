/*
  # Setup Avatar Storage Policies

  1. Storage Setup
    - Create avatars bucket if it doesn't exist
    - Enable RLS on storage.objects table
    - Set up proper policies for avatar management

  2. Security Policies
    - Allow authenticated users to upload avatars
    - Allow users to view their own avatars
    - Allow users to update their own avatars
    - Allow users to delete their own avatars
*/

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own avatars" ON storage.objects;

-- Allow authenticated users to upload avatars
CREATE POLICY "Allow authenticated users to upload avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Allow anyone to view avatars (since they're public)
CREATE POLICY "Allow authenticated users to view avatars"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Allow authenticated users to update their own avatars"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = owner)
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = owner);

-- Allow users to delete their own avatars
CREATE POLICY "Allow authenticated users to delete their own avatars"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = owner);