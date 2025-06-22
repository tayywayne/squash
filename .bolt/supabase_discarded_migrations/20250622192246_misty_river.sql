/*
  # Create avatar storage bucket and policies

  1. Storage Setup
    - Create avatars bucket if it doesn't exist
    - Make bucket public for avatar access
    
  2. Storage Policies
    - Allow authenticated users to upload their own avatars
    - Allow authenticated users to view their own avatars  
    - Allow authenticated users to delete their own avatars
    - Allow public read access to all avatars

  3. Security
    - Users can only upload/modify files with their user ID in the path
    - Public can read all avatars for profile display
*/

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies using Supabase's storage policy functions
-- These functions handle the RLS setup properly

-- Policy to allow authenticated users to upload their own avatars
SELECT storage.create_policy(
  'Allow authenticated users to upload avatars',
  'avatars',
  'INSERT',
  'authenticated',
  'bucket_id = ''avatars'' AND name LIKE ''avatars/'' || auth.uid() || ''-%'''
);

-- Policy to allow authenticated users to view their own avatars
SELECT storage.create_policy(
  'Allow authenticated users to view avatars', 
  'avatars',
  'SELECT',
  'authenticated', 
  'bucket_id = ''avatars'' AND name LIKE ''avatars/'' || auth.uid() || ''-%'''
);

-- Policy to allow authenticated users to delete their own avatars
SELECT storage.create_policy(
  'Allow authenticated users to delete avatars',
  'avatars', 
  'DELETE',
  'authenticated',
  'bucket_id = ''avatars'' AND name LIKE ''avatars/'' || auth.uid() || ''-%'''
);

-- Policy to allow public read access to all avatars
SELECT storage.create_policy(
  'Allow public read access to avatars',
  'avatars',
  'SELECT', 
  'public',
  'bucket_id = ''avatars'''
);