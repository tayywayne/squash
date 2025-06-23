/*
  # Add AI Judgment Feed functionality

  1. New Tables
    - `conflict_votes`
      - `id` (uuid, primary key)
      - `conflict_id` (uuid, references conflicts)
      - `voter_id` (uuid, references auth.users)
      - `vote_type` (text, one of 6 fixed types)
      - `created_at` (timestamp)

  2. Changes to existing tables
    - Add `ai_final_summary` to conflicts table for short preview

  3. Security
    - Enable RLS on `conflict_votes` table
    - Add policies for voting functionality
    - Prevent users from voting on their own conflicts
    - Prevent duplicate votes (one vote per user per conflict)

  4. Functions
    - Function to get public conflicts with vote counts
    - Function to get vote counts for a specific conflict
*/

-- Add ai_final_summary to conflicts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conflicts' AND column_name = 'ai_final_summary'
  ) THEN
    ALTER TABLE conflicts ADD COLUMN ai_final_summary text;
  END IF;
END $$;

-- Create conflict_votes table
CREATE TABLE IF NOT EXISTS conflict_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conflict_id uuid REFERENCES conflicts(id) ON DELETE CASCADE NOT NULL,
  voter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('both_wrong', 'user1_wrong', 'user2_wrong', 'get_therapy', 'ai_right', 'reset_conflict')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(conflict_id, voter_id) -- Prevent duplicate votes per user per conflict
);

-- Enable RLS on conflict_votes
ALTER TABLE conflict_votes ENABLE ROW LEVEL SECURITY;

-- Policies for conflict_votes table
CREATE POLICY "Anyone can read conflict votes"
  ON conflict_votes
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can vote on conflicts"
  ON conflict_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = voter_id AND
    -- Prevent voting on own conflicts
    NOT EXISTS (
      SELECT 1 FROM conflicts c 
      WHERE c.id = conflict_id 
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own votes"
  ON conflict_votes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = voter_id)
  WITH CHECK (auth.uid() = voter_id);

-- Function to get public conflicts with AI rulings
CREATE OR REPLACE FUNCTION public.get_public_ai_rulings()
RETURNS TABLE (
  conflict_id uuid,
  title text,
  ai_final_summary text,
  ai_final_ruling text,
  final_ruling_issued_at timestamptz,
  user1_username text,
  user2_username text,
  user1_archetype_emoji text,
  user2_archetype_emoji text,
  user1_supporter_emoji text,
  user2_supporter_emoji text,
  total_votes bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conflict_id,
    c.title,
    c.ai_final_summary,
    c.ai_final_ruling,
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
      cv.conflict_id,
      COUNT(*) as total_votes
    FROM conflict_votes cv
    GROUP BY cv.conflict_id
  ) vote_counts ON c.id = vote_counts.conflict_id
  WHERE c.ai_final_summary IS NOT NULL
  ORDER BY c.final_ruling_issued_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get vote counts for a specific conflict
CREATE OR REPLACE FUNCTION public.get_conflict_vote_counts(conflict_uuid uuid)
RETURNS TABLE (
  vote_type text,
  vote_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cv.vote_type,
    COUNT(*) as vote_count
  FROM conflict_votes cv
  WHERE cv.conflict_id = conflict_uuid
  GROUP BY cv.vote_type
  ORDER BY vote_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's vote for a specific conflict
CREATE OR REPLACE FUNCTION public.get_user_vote_for_conflict(conflict_uuid uuid, user_uuid uuid)
RETURNS TABLE (
  vote_type text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cv.vote_type,
    cv.created_at
  FROM conflict_votes cv
  WHERE cv.conflict_id = conflict_uuid AND cv.voter_id = user_uuid
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_public_ai_rulings() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_conflict_vote_counts(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_vote_for_conflict(uuid, uuid) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS conflict_votes_conflict_id_idx ON conflict_votes(conflict_id);
CREATE INDEX IF NOT EXISTS conflict_votes_voter_id_idx ON conflict_votes(voter_id);
CREATE INDEX IF NOT EXISTS conflict_votes_vote_type_idx ON conflict_votes(vote_type);
CREATE INDEX IF NOT EXISTS conflicts_ai_final_summary_idx ON conflicts(ai_final_summary) WHERE ai_final_summary IS NOT NULL;