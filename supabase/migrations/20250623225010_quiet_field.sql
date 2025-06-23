/*
  # Fix get_public_ai_rulings RPC function column reference

  1. Changes
    - Update the get_public_ai_rulings RPC function to use the correct column name `final_ai_ruling` instead of `ai_final_ruling`
    - This aligns with the actual database schema where the column is named `final_ai_ruling`

  2. Security
    - Maintains existing RLS policies and permissions
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_public_ai_rulings();

-- Recreate the function with the correct column name
CREATE OR REPLACE FUNCTION get_public_ai_rulings()
RETURNS TABLE (
  conflict_id uuid,
  title text,
  ai_final_summary text,
  final_ai_ruling text,
  final_ruling_issued_at timestamptz,
  user1_username text,
  user2_username text,
  user1_archetype_emoji text,
  user2_archetype_emoji text,
  user1_supporter_emoji text,
  user2_supporter_emoji text,
  total_votes bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conflict_id,
    c.title,
    c.ai_final_summary,
    c.final_ai_ruling,  -- Fixed: was ai_final_ruling, now final_ai_ruling
    c.final_ruling_issued_at,
    p1.username as user1_username,
    p2.username as user2_username,
    p1.archetype_emoji as user1_archetype_emoji,
    p2.archetype_emoji as user2_archetype_emoji,
    p1.supporter_emoji as user1_supporter_emoji,
    p2.supporter_emoji as user2_supporter_emoji,
    COALESCE(vote_counts.total_votes, 0) as total_votes
  FROM conflicts c
  LEFT JOIN profiles p1 ON c.user1_id = p1.id
  LEFT JOIN profiles p2 ON c.user2_id = p2.id
  LEFT JOIN (
    SELECT 
      conflict_id,
      COUNT(*) as total_votes
    FROM conflict_votes
    GROUP BY conflict_id
  ) vote_counts ON c.id = vote_counts.conflict_id
  WHERE c.status = 'final_judgment'
    AND c.ai_final_summary IS NOT NULL
    AND c.final_ai_ruling IS NOT NULL  -- Fixed: was ai_final_ruling, now final_ai_ruling
  ORDER BY c.final_ruling_issued_at DESC;
END;
$$;