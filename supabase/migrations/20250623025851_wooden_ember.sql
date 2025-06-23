/*
  # Add final AI ruling fields to conflicts table

  1. Changes
    - Add `final_ai_ruling` (text, nullable) to store the dramatic final ruling
    - Add `final_ruling_issued_at` (timestamp, nullable) to track when final ruling was issued

  2. Security
    - No RLS changes needed as these are additional fields on existing table
*/

-- Add final ruling fields to conflicts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conflicts' AND column_name = 'final_ai_ruling'
  ) THEN
    ALTER TABLE conflicts ADD COLUMN final_ai_ruling text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conflicts' AND column_name = 'final_ruling_issued_at'
  ) THEN
    ALTER TABLE conflicts ADD COLUMN final_ruling_issued_at timestamptz;
  END IF;
END $$;