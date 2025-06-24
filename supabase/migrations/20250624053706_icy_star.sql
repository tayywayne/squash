/*
  # Create Reddit Conflicts system

  1. New Tables
    - `reddit_conflicts`
      - `id` (uuid, primary key)
      - `reddit_post_id` (text, unique)
      - `subreddit` (text)
      - `title` (text)
      - `author` (text)
      - `original_text` (text)
      - `ai_summary` (text)
      - `ai_suggestion` (text)
      - `created_at` (timestamp)
      - `is_active` (boolean, for current daily conflict)

    - `reddit_conflict_votes`
      - `id` (uuid, primary key)
      - `reddit_conflict_id` (uuid, references reddit_conflicts)
      - `voter_id` (uuid, references auth.users)
      - `vote_type` (text, one of: 'nta', 'yta', 'esh', 'nah')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for reading and voting

  3. Functions
    - Function to get current daily conflict
    - Function to get vote counts
    - Function to cast votes
*/

-- Create reddit_conflicts table
CREATE TABLE IF NOT EXISTS reddit_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reddit_post_id text UNIQUE NOT NULL,
  subreddit text NOT NULL DEFAULT 'AmItheAsshole',
  title text NOT NULL,
  author text NOT NULL,
  original_text text NOT NULL,
  ai_summary text,
  ai_suggestion text,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT false
);

-- Create reddit_conflict_votes table
CREATE TABLE IF NOT EXISTS reddit_conflict_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reddit_conflict_id uuid REFERENCES reddit_conflicts(id) ON DELETE CASCADE NOT NULL,
  voter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('nta', 'yta', 'esh', 'nah')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(reddit_conflict_id, voter_id)
);

-- Enable RLS
ALTER TABLE reddit_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reddit_conflict_votes ENABLE ROW LEVEL SECURITY;

-- Policies for reddit_conflicts
CREATE POLICY "Anyone can read reddit conflicts"
  ON reddit_conflicts
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policies for reddit_conflict_votes
CREATE POLICY "Anyone can read reddit conflict votes"
  ON reddit_conflict_votes
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can vote on reddit conflicts"
  ON reddit_conflict_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can update their own reddit votes"
  ON reddit_conflict_votes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = voter_id)
  WITH CHECK (auth.uid() = voter_id);

-- Function to get current daily conflict
CREATE OR REPLACE FUNCTION public.get_current_reddit_conflict()
RETURNS TABLE (
  id uuid,
  reddit_post_id text,
  subreddit text,
  title text,
  author text,
  original_text text,
  ai_summary text,
  ai_suggestion text,
  created_at timestamptz,
  vote_counts jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rc.id,
    rc.reddit_post_id,
    rc.subreddit,
    rc.title,
    rc.author,
    rc.original_text,
    rc.ai_summary,
    rc.ai_suggestion,
    rc.created_at,
    COALESCE(
      jsonb_object_agg(
        rcv.vote_type, 
        rcv.vote_count
      ) FILTER (WHERE rcv.vote_type IS NOT NULL),
      '{}'::jsonb
    ) AS vote_counts
  FROM reddit_conflicts rc
  LEFT JOIN (
    SELECT 
      reddit_conflict_votes.reddit_conflict_id,
      reddit_conflict_votes.vote_type,
      COUNT(*) AS vote_count
    FROM reddit_conflict_votes
    GROUP BY reddit_conflict_votes.reddit_conflict_id, reddit_conflict_votes.vote_type
  ) rcv ON rc.id = rcv.reddit_conflict_id
  WHERE rc.is_active = true
  GROUP BY 
    rc.id, 
    rc.reddit_post_id,
    rc.subreddit,
    rc.title, 
    rc.author,
    rc.original_text,
    rc.ai_summary, 
    rc.ai_suggestion, 
    rc.created_at
  ORDER BY rc.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's vote for reddit conflict
CREATE OR REPLACE FUNCTION public.get_user_reddit_vote(conflict_uuid uuid, user_uuid uuid)
RETURNS TABLE (
  vote_type text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rcv.vote_type,
    rcv.created_at
  FROM reddit_conflict_votes rcv
  WHERE rcv.reddit_conflict_id = conflict_uuid AND rcv.voter_id = user_uuid
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_current_reddit_conflict() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_reddit_vote(uuid, uuid) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS reddit_conflicts_is_active_idx ON reddit_conflicts(is_active);
CREATE INDEX IF NOT EXISTS reddit_conflicts_created_at_idx ON reddit_conflicts(created_at);
CREATE INDEX IF NOT EXISTS reddit_conflict_votes_conflict_id_idx ON reddit_conflict_votes(reddit_conflict_id);
CREATE INDEX IF NOT EXISTS reddit_conflict_votes_voter_id_idx ON reddit_conflict_votes(voter_id);