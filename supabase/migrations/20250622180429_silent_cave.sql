/*
  # Create triggers to automatically update global_stats

  1. Functions
    - `update_global_conflict_stats()` - Updates global stats when conflicts change

  2. Triggers
    - `trg_conflicts_insert` - Updates total count on new conflicts
    - `trg_conflicts_update` - Updates resolved count on status changes
    - `trg_conflicts_delete` - Updates counts on conflict deletion

  3. Security
    - Function runs with SECURITY DEFINER to ensure proper permissions
*/

-- Function to update global_stats
CREATE OR REPLACE FUNCTION public.update_global_conflict_stats()
RETURNS trigger AS $$
BEGIN
  -- Handle INSERT: increment total conflicts
  IF TG_OP = 'INSERT' THEN
    UPDATE global_stats 
    SET total_conflicts = total_conflicts + 1, 
        last_updated = now();
    
    -- If the new conflict is already resolved (edge case)
    IF NEW.status = 'resolved' THEN
      UPDATE global_stats 
      SET resolved_conflicts = resolved_conflicts + 1, 
          last_updated = now();
    END IF;
    
    RETURN NEW;
  END IF;

  -- Handle UPDATE: check for status changes
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Conflict became resolved
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
      UPDATE global_stats 
      SET resolved_conflicts = resolved_conflicts + 1, 
          last_updated = now();
    -- Conflict was resolved but now isn't (e.g., reopened or abandoned)
    ELSIF OLD.status = 'resolved' AND NEW.status != 'resolved' THEN
      UPDATE global_stats 
      SET resolved_conflicts = GREATEST(0, resolved_conflicts - 1), 
          last_updated = now();
    END IF;
    
    RETURN NEW;
  END IF;

  -- Handle DELETE: decrement counts
  IF TG_OP = 'DELETE' THEN
    UPDATE global_stats 
    SET total_conflicts = GREATEST(0, total_conflicts - 1), 
        last_updated = now();
    
    -- If deleted conflict was resolved, decrement resolved count too
    IF OLD.status = 'resolved' THEN
      UPDATE global_stats 
      SET resolved_conflicts = GREATEST(0, resolved_conflicts - 1), 
          last_updated = now();
    END IF;
    
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trg_conflicts_insert ON conflicts;
DROP TRIGGER IF EXISTS trg_conflicts_update ON conflicts;
DROP TRIGGER IF EXISTS trg_conflicts_delete ON conflicts;

-- Trigger for new conflicts
CREATE TRIGGER trg_conflicts_insert
  AFTER INSERT ON conflicts
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_global_conflict_stats();

-- Trigger for conflict updates
CREATE TRIGGER trg_conflicts_update
  AFTER UPDATE ON conflicts
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_global_conflict_stats();

-- Trigger for conflict deletions
CREATE TRIGGER trg_conflicts_delete
  AFTER DELETE ON conflicts
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_global_conflict_stats();