/*
  # Add is_admin field to profiles table

  1. Changes
    - Add `is_admin` (boolean, default false) to track if a user has admin privileges
    - This allows for admin-specific features and UI elements

  2. Security
    - No RLS changes needed as this is an additional field on existing table
    - Admin status will be visible to all users who can view profiles
*/

-- Add is_admin field to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;