/*
  # Update leaderboard function to exclude final judgment from resolved count

  1. Changes
    - Update the `get_user_conflict_stats` function to only count 'resolved' status conflicts
    - Final judgment conflicts will not be counted in the resolved_conflicts statistic
    - This ensures leaderboard resolution rates only reflect mutually resolved conflicts

  2. Function Updates
    - Modify the resolved_conflicts calculation to exclude 'final_judgment' status
    - Keep total_conflicts counting all conflicts regardless of status
*/

-- Drop and recreate the function with updated resolved count logic
DROP FUNCTION IF EXISTS public.get_user_conflict_stats(timestamptz);

-- Create updated function to get user conflict statistics excluding final judgment from resolved count
CREATE OR REPLACE FUNCTION public.get_user_conflict_stats(start_date timestamptz DEFAULT NULL)
RETURNS TABLE (
  user_id uuid,
  username text,
  first_name text,
  last_name text,
  avatar_url text,
  archetype_emoji text,
  total_conflicts bigint,
  resolved_conflicts bigint,
  resolution_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      p.id as user_id,
      p.username,
      p.first_name,
      p.last_name,
      p.avatar_url,
      p.archetype_emoji,
      COUNT(DISTINCT c.id) as total_conflicts,
      -- Only count 'resolved' status conflicts, not 'final_judgment'
      COUNT(DISTINCT CASE WHEN c.status = 'resolved' THEN c.id END) as resolved_conflicts
    FROM profiles p
    INNER JOIN (
      -- Get all conflicts where user is either user1 or user2
      SELECT id, user1_id as user_id, status, created_at FROM conflicts
      UNION ALL
      SELECT id, user2_id as user_id, status, created_at FROM conflicts WHERE user2_id IS NOT NULL
    ) c ON p.id = c.user_id
    WHERE 
      (start_date IS NULL OR c.created_at >= start_date)
    GROUP BY p.id, p.username, p.first_name, p.last_name, p.avatar_url, p.archetype_emoji
    HAVING COUNT(DISTINCT c.id) > 0  -- Only include users with at least one conflict
  )
  SELECT 
    us.user_id,
    us.username,
    us.first_name,
    us.last_name,
    us.avatar_url,
    us.archetype_emoji,
    us.total_conflicts,
    us.resolved_conflicts,
    CASE 
      WHEN us.total_conflicts > 0 THEN 
        ROUND((us.resolved_conflicts::numeric / us.total_conflicts::numeric) * 100, 1)
      ELSE 0 
    END as resolution_rate
  FROM user_stats us
  ORDER BY resolution_rate DESC, total_conflicts DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_conflict_stats(timestamptz) TO authenticated;