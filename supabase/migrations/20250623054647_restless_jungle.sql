/*
  # Add supporter fields to profiles table

  1. Changes
    - Add `supporter_level` (text, nullable) to store the supporter tier (tip_1, tip_2, tip_3)
    - Add `supporter_emoji` (text, nullable) to store the supporter emoji (🩹, 💅, 🔥👑)
    - Add `supporter_since` (timestamp, nullable) to track when they became a supporter

  2. Security
    - No RLS changes needed as these are additional fields on existing table
*/

-- Add supporter fields to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'supporter_level'
  ) THEN
    ALTER TABLE profiles ADD COLUMN supporter_level text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'supporter_emoji'
  ) THEN
    ALTER TABLE profiles ADD COLUMN supporter_emoji text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'supporter_since'
  ) THEN
    ALTER TABLE profiles ADD COLUMN supporter_since timestamptz;
  END IF;
END $$;