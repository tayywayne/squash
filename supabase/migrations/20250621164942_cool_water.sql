/*
  # Add first_name and last_name to profiles table

  1. Changes
    - Add `first_name` (text, nullable) to store user's first name
    - Add `last_name` (text, nullable) to store user's last name

  2. Security
    - No RLS changes needed as these are additional fields on existing table
*/

-- Add first_name and last_name fields to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN first_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_name text;
  END IF;
END $$;