/*
  # Fix ambiguous conflict_id reference in get_public_ai_rulings function

  1. Database Function Updates
    - Update the `get_public_ai_rulings` function to properly qualify column references
    - Ensure `conflict_id` references are explicitly qualified with table aliases
    - Fix the ambiguous column reference that's causing the 400 error

  2. Changes Made
    - Replace ambiguous `conflict_id` with properly qualified column references
    - Use table aliases to make column references unambiguous
    - Maintain the same function signature and return structure
*/

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_public_ai_rulings();

-- Recreate the function with properly qualified column references
CREATE OR REPLACE FUNCTION get_public_ai_rulings()
RETURNS TABLE (
  conflict_id uuid,
  title text,
  ai_final_summary text,
  final_ai_ruling text,
  final_ruling_issued_at timestamptz,
  user1_satisfaction boolean,
  user2_satisfaction boolean,
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
    c.user1_satisfaction,
    c.user2_satisfaction,
    COALESCE(
      jsonb_object_agg(
        cv.vote_type, 
        cv.vote_count
      ) FILTER (WHERE cv.vote_type IS NOT NULL),
      '{}'::jsonb
    ) AS vote_counts
  FROM conflicts c
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
    c.user1_satisfaction,
    c.user2_satisfaction
  ORDER BY c.final_ruling_issued_at DESC;
END;
$$;