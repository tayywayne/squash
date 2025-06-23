/*
  # Add conflict archetype fields to profiles table

  1. Changes
    - Add `conflict_archetype` (text, nullable) to store the archetype title
    - Add `archetype_emoji` (text, nullable) to store the emoji badge
    - Add `archetype_assigned_at` (timestamp, nullable) to track when archetype was assigned

  2. Security
    - No RLS changes needed as these are additional fields on existing table
*/

-- Add conflict archetype fields to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'conflict_archetype'
  ) THEN
    ALTER TABLE profiles ADD COLUMN conflict_archetype text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'archetype_emoji'
  ) THEN
    ALTER TABLE profiles ADD COLUMN archetype_emoji text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'archetype_assigned_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN archetype_assigned_at timestamptz;
  END IF;
END $$;