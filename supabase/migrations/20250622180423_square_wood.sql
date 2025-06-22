/*
  # Create global_stats table for public statistics

  1. New Tables
    - `global_stats`
      - `id` (uuid, primary key)
      - `total_conflicts` (bigint, default 0)
      - `resolved_conflicts` (bigint, default 0)
      - `last_updated` (timestamp, default now())

  2. Security
    - Enable RLS on `global_stats` table
    - Add policy for anonymous users to read global stats
    - Authenticated users can also read

  3. Initial Data
    - Insert initial row with current conflict counts
*/

-- Create global_stats table
CREATE TABLE IF NOT EXISTS global_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_conflicts bigint NOT NULL DEFAULT 0,
  resolved_conflicts bigint NOT NULL DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE global_stats ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous and authenticated users to read global stats
CREATE POLICY "Allow public read for global stats"
  ON global_stats
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Initialize with current conflict data
DO $$
DECLARE
  current_total bigint;
  current_resolved bigint;
BEGIN
  -- Get current counts from conflicts table
  SELECT COUNT(*) INTO current_total FROM conflicts;
  SELECT COUNT(*) INTO current_resolved FROM conflicts WHERE status = 'resolved';
  
  -- Insert initial row if table is empty
  INSERT INTO global_stats (total_conflicts, resolved_conflicts)
  SELECT current_total, current_resolved
  WHERE NOT EXISTS (SELECT 1 FROM global_stats);
END $$;