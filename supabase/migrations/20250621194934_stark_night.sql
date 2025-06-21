/*
  # Add core issues clarification fields to conflicts table

  1. Changes
    - Add `user1_core_issue` (text, nullable) to store user1's core issue statement
    - Add `user2_core_issue` (text, nullable) to store user2's core issue statement
    - Add `ai_core_reflection` (text, nullable) to store AI's reflection on core issues
    - Add `ai_core_suggestion` (text, nullable) to store AI's suggestion based on core issues
    - Add `core_issues_attempted_at` (timestamp, nullable) to track when core issues step was attempted

  2. Security
    - No RLS changes needed as these are additional fields on existing table
*/

-- Add core issues fields to conflicts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conflicts' AND column_name = 'user1_core_issue'
  ) THEN
    ALTER TABLE conflicts ADD COLUMN user1_core_issue text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conflicts' AND column_name = 'user2_core_issue'
  ) THEN
    ALTER TABLE conflicts ADD COLUMN user2_core_issue text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conflicts' AND column_name = 'ai_core_reflection'
  ) THEN
    ALTER TABLE conflicts ADD COLUMN ai_core_reflection text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conflicts' AND column_name = 'ai_core_suggestion'
  ) THEN
    ALTER TABLE conflicts ADD COLUMN ai_core_suggestion text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conflicts' AND column_name = 'core_issues_attempted_at'
  ) THEN
    ALTER TABLE conflicts ADD COLUMN core_issues_attempted_at timestamptz;
  END IF;
END $$;