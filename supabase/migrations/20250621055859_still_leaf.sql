/*
  # Add rehash fields to conflicts table

  1. Changes
    - Add `ai_rehash_summary` (text, nullable) to store the rehashed AI summary
    - Add `ai_rehash_suggestion` (text, nullable) to store the rehashed AI suggestion  
    - Add `rehash_attempted_at` (timestamp, nullable) to track when rehash was attempted

  2. Security
    - No RLS changes needed as these are additional fields on existing table
*/

-- Add rehash fields to conflicts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conflicts' AND column_name = 'ai_rehash_summary'
  ) THEN
    ALTER TABLE conflicts ADD COLUMN ai_rehash_summary text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conflicts' AND column_name = 'ai_rehash_suggestion'
  ) THEN
    ALTER TABLE conflicts ADD COLUMN ai_rehash_suggestion text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conflicts' AND column_name = 'rehash_attempted_at'
  ) THEN
    ALTER TABLE conflicts ADD COLUMN rehash_attempted_at timestamptz;
  END IF;
END $$;