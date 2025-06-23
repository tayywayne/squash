/*
  # Fix get_public_ai_rulings function to include user profile information

  1. Changes
    - Update the function to include user1_id, user2_id for navigation
    - Include user1_username, user2_username for display
    - Include archetype and supporter emojis for both users
    - Maintain vote counts as JSONB for flexibility
    - Add proper LEFT JOINs for profiles table

  2. Security
    - Function remains SECURITY DEFINER for proper access
    - Only returns public conflicts with final judgments
*/

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_public_ai_rulings();

-- Recreate the function with user profile information
CREATE OR REPLACE FUNCTION get_public_ai_rulings()
RETURNS TABLE (
  conflict_id uuid,
  title text,
  ai_final_summary text,
  final_ai_ruling text,
  final_ruling_issued_at timestamptz,
  user1_id uuid,
  user2_id uuid,
  user1_username text,
  user2_username text,
  user1_archetype_emoji text,
  user2_archetype_emoji text,
  user1_supporter_emoji text,
  user2_supporter_emoji text,
  vote_counts jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS conflict_id,
    c.title,
    c.ai_final_summary,
    c.final_ai_ruling,
    c.final_ruling_issued_at,
    c.user1_id,
    c.user2_id,
    p1.username AS user1_username,
    p2.username AS user2_username,
    p1.archetype_emoji AS user1_archetype_emoji,
    p2.archetype_emoji AS user2_archetype_emoji,
    p1.supporter_emoji AS user1_supporter_emoji,
    p2.supporter_emoji AS user2_supporter_emoji,
    COALESCE(
      jsonb_object_agg(
        cv.vote_type, 
        cv.vote_count
      ) FILTER (WHERE cv.vote_type IS NOT NULL),
      '{}'::jsonb
    ) AS vote_counts
  FROM conflicts c
  LEFT JOIN profiles p1 ON c.user1_id = p1.id
  LEFT JOIN profiles p2 ON c.user2_id = p2.id
  LEFT JOIN (
    SELECT 
      conflict_votes.conflict_id,
      conflict_votes.vote_type,
      COUNT(*) AS vote_count
    FROM conflict_votes
    GROUP BY conflict_votes.conflict_id, conflict_votes.vote_type
  ) cv ON c.id = cv.conflict_id
  WHERE c.status = 'final_judgment'
    AND c.final_ai_ruling IS NOT NULL
    AND c.ai_final_summary IS NOT NULL
  GROUP BY 
    c.id, 
    c.title, 
    c.ai_final_summary, 
    c.final_ai_ruling, 
    c.final_ruling_issued_at,
    c.user1_id,
    c.user2_id,
    p1.username,
    p2.username,
    p1.archetype_emoji,
    p2.archetype_emoji,
    p1.supporter_emoji,
    p2.supporter_emoji
  ORDER BY c.final_ruling_issued_at DESC;
END;
$$;