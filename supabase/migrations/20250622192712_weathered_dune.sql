/*
  # Setup Avatar Storage Bucket

  1. Storage Setup
    - Create avatars bucket if it doesn't exist
    - Set bucket to public for easy access to profile images

  2. Note
    - Storage policies need to be set up manually in the Supabase dashboard
    - This migration only creates the bucket structure
*/

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Update bucket to ensure it's public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';