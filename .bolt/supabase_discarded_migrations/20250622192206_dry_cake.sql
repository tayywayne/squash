/*
  # Create avatar storage bucket and policies

  1. Storage Setup
    - Create avatars bucket if it doesn't exist
    - Enable RLS on storage.objects
    
  2. Security Policies
    - Allow authenticated users to upload their own avatars
    - Allow authenticated users to view their own avatars
    - Allow authenticated users to delete their own avatars
    - Allow public read access to avatars (for profile viewing)
*/

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (should already be enabled by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;

-- Policy to allow authenticated users to upload their own avatars
CREATE POLICY "Allow authenticated users to upload their own avatars"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'avatars' AND 
  name LIKE 'avatars/' || auth.uid() || '-%'
);

-- Policy to allow authenticated users to view their own avatars
CREATE POLICY "Allow authenticated users to view their own avatars"
ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'avatars' AND 
  name LIKE 'avatars/' || auth.uid() || '-%'
);

-- Policy to allow authenticated users to delete their own avatars
CREATE POLICY "Allow authenticated users to delete their own avatars"
ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'avatars' AND 
  name LIKE 'avatars/' || auth.uid() || '-%'
);

-- Policy to allow public read access to all avatars (so other users can see profile pictures)
CREATE POLICY "Allow public read access to avatars"
ON storage.objects FOR SELECT TO public USING (
  bucket_id = 'avatars'
);