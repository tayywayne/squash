/*
  # Fix update_global_conflict_stats trigger function

  1. Problem
    - The trigger function `update_global_conflict_stats()` is performing UPDATE operations without WHERE clauses
    - This causes "UPDATE requires a WHERE clause" errors when inserting conflicts

  2. Solution
    - Recreate the trigger function with proper WHERE clauses
    - Ensure it updates the single row in global_stats table correctly
    - Handle the case where no row exists in global_stats (create one)

  3. Changes
    - Drop and recreate the `update_global_conflict_stats()` function
    - Add proper WHERE clause to UPDATE statements
    - Add INSERT logic if no stats row exists
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS update_global_conflict_stats();

-- Recreate the function with proper WHERE clauses
CREATE OR REPLACE FUNCTION update_global_conflict_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure there's at least one row in global_stats
  INSERT INTO global_stats (total_conflicts, resolved_conflicts, last_updated)
  SELECT 0, 0, now()
  WHERE NOT EXISTS (SELECT 1 FROM global_stats);

  -- Update the stats based on the current state of conflicts table
  UPDATE global_stats 
  SET 
    total_conflicts = (
      SELECT COUNT(*) 
      FROM conflicts
    ),
    resolved_conflicts = (
      SELECT COUNT(*) 
      FROM conflicts 
      WHERE status = 'resolved'
    ),
    last_updated = now()
  WHERE id = (
    SELECT id 
    FROM global_stats 
    LIMIT 1
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;