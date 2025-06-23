/*
  # Fix update_global_conflict_stats trigger function

  1. Problem
    - The trigger function `update_global_conflict_stats()` is performing UPDATE operations without WHERE clauses
    - This causes "UPDATE requires a WHERE clause" errors when inserting conflicts

  2. Solution
    - Drop triggers first, then function, then recreate everything with proper WHERE clauses
    - Ensure it updates the single row in global_stats table correctly
    - Handle the case where no row exists in global_stats (create one)

  3. Changes
    - Drop triggers and function in correct order
    - Recreate the `update_global_conflict_stats()` function with proper WHERE clauses
    - Recreate all triggers
*/

-- Drop the triggers first (they depend on the function)
DROP TRIGGER IF EXISTS trg_conflicts_insert ON conflicts;
DROP TRIGGER IF EXISTS trg_conflicts_update ON conflicts;
DROP TRIGGER IF EXISTS trg_conflicts_delete ON conflicts;

-- Now we can drop the function
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

-- Recreate the triggers
CREATE TRIGGER trg_conflicts_insert
  AFTER INSERT ON conflicts
  FOR EACH ROW 
  EXECUTE FUNCTION update_global_conflict_stats();

CREATE TRIGGER trg_conflicts_update
  AFTER UPDATE ON conflicts
  FOR EACH ROW 
  EXECUTE FUNCTION update_global_conflict_stats();

CREATE TRIGGER trg_conflicts_delete
  AFTER DELETE ON conflicts
  FOR EACH ROW 
  EXECUTE FUNCTION update_global_conflict_stats();