/*
  # Update global stats to exclude final judgment from resolved count

  1. Changes
    - Update the `update_global_conflict_stats()` function to only count 'resolved' status conflicts
    - Final judgment conflicts will not be counted in the resolved_conflicts statistic
    - This separates mutually resolved conflicts from AI-imposed final judgments

  2. Function Updates
    - Modify the resolved_conflicts calculation to exclude 'final_judgment' status
    - Keep total_conflicts counting all conflicts regardless of status
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS update_global_conflict_stats();

-- Recreate the function with updated resolved count logic
CREATE OR REPLACE FUNCTION update_global_conflict_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure there's at least one row in global_stats
  INSERT INTO global_stats (total_conflicts, resolved_conflicts, last_updated)
  SELECT 0, 0, now()
  WHERE NOT EXISTS (SELECT 1 FROM global_stats);

  -- Update the stats based on the current state of conflicts table
  -- Only count 'resolved' status conflicts, not 'final_judgment'
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