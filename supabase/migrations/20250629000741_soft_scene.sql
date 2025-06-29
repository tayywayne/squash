/*
  # Create Public Debates System

  1. New Tables
    - `public_debates`
      - `id` (uuid, primary key)
      - `title` (text) - The debate topic (e.g., "Pizza or Tacos?")
      - `creator_id` (uuid, references auth.users)
      - `creator_position` (text) - Creator's argument
      - `creator_side` (text) - Creator's side name (e.g., "Pizza")
      - `opponent_id` (uuid, references auth.users, nullable)
      - `opponent_email` (text) - Email to invite opponent
      - `opponent_position` (text, nullable) - Opponent's argument
      - `opponent_side` (text) - Opponent's side name (e.g., "Tacos")
      - `created_at` (timestamp)
      - `expires_at` (timestamp) - 7 days after both sides submitted
      - `status` (text) - 'pending', 'active', 'complete'
      - `winner_id` (uuid, references auth.users, nullable)
      - `creator_votes` (integer, default 0)
      - `opponent_votes` (integer, default 0)

    - `debate_votes`
      - `id` (uuid, primary key)
      - `debate_id` (uuid, references public_debates)
      - `voter_id` (uuid, references auth.users)
      - `vote_for_id` (uuid, references auth.users) - Either creator_id or opponent_id
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for reading and voting
    - Prevent users from voting on their own debates
    - Prevent duplicate votes (one vote per user per debate)

  3. Functions
    - Function to get active debates with vote counts
    - Function to get debate by ID with vote counts
    - Function to cast a vote
*/

-- Create public_debates table
CREATE TABLE IF NOT EXISTS public_debates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  creator_id uuid REFERENCES auth.users(id) NOT NULL,
  creator_position text NOT NULL,
  creator_side text NOT NULL,
  opponent_id uuid REFERENCES auth.users(id),
  opponent_email text NOT NULL,
  opponent_position text,
  opponent_side text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'complete')),
  winner_id uuid REFERENCES auth.users(id),
  creator_votes integer DEFAULT 0,
  opponent_votes integer DEFAULT 0
);

-- Create debate_votes table
CREATE TABLE IF NOT EXISTS debate_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id uuid REFERENCES public_debates(id) ON DELETE CASCADE NOT NULL,
  voter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_for_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(debate_id, voter_id) -- Prevent duplicate votes
);

-- Enable RLS
ALTER TABLE public_debates ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_votes ENABLE ROW LEVEL SECURITY;

-- Policies for public_debates
CREATE POLICY "Anyone can read public debates"
  ON public_debates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create debates"
  ON public_debates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own debates or respond to invites"
  ON public_debates
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = creator_id OR 
    (auth.email() = opponent_email AND opponent_id IS NULL)
  );

-- Policies for debate_votes
CREATE POLICY "Anyone can read debate votes"
  ON debate_votes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can vote on debates they didn't create"
  ON debate_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = voter_id AND
    NOT EXISTS (
      SELECT 1 FROM public_debates
      WHERE public_debates.id = debate_id AND 
      (public_debates.creator_id = auth.uid() OR public_debates.opponent_id = auth.uid())
    )
  );

-- Function to get active debates with vote counts
CREATE OR REPLACE FUNCTION get_active_debates()
RETURNS TABLE (
  id uuid,
  title text,
  creator_id uuid,
  creator_username text,
  creator_position text,
  creator_side text,
  creator_archetype_emoji text,
  creator_supporter_emoji text,
  opponent_id uuid,
  opponent_username text,
  opponent_position text,
  opponent_side text,
  opponent_archetype_emoji text,
  opponent_supporter_emoji text,
  created_at timestamptz,
  expires_at timestamptz,
  status text,
  creator_votes integer,
  opponent_votes integer,
  user_vote_for_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.creator_id,
    p1.username as creator_username,
    d.creator_position,
    d.creator_side,
    p1.archetype_emoji as creator_archetype_emoji,
    p1.supporter_emoji as creator_supporter_emoji,
    d.opponent_id,
    p2.username as opponent_username,
    d.opponent_position,
    d.opponent_side,
    p2.archetype_emoji as opponent_archetype_emoji,
    p2.supporter_emoji as opponent_supporter_emoji,
    d.created_at,
    d.expires_at,
    d.status,
    d.creator_votes,
    d.opponent_votes,
    (
      SELECT vote_for_id 
      FROM debate_votes 
      WHERE debate_id = d.id AND voter_id = auth.uid()
      LIMIT 1
    ) as user_vote_for_id
  FROM public_debates d
  LEFT JOIN profiles p1 ON d.creator_id = p1.id
  LEFT JOIN profiles p2 ON d.opponent_id = p2.id
  WHERE d.status = 'active'
  ORDER BY d.created_at DESC;
END;
$$;

-- Function to get debate by ID with vote counts
CREATE OR REPLACE FUNCTION get_debate_by_id(p_debate_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  creator_id uuid,
  creator_username text,
  creator_position text,
  creator_side text,
  creator_archetype_emoji text,
  creator_supporter_emoji text,
  opponent_id uuid,
  opponent_username text,
  opponent_position text,
  opponent_side text,
  opponent_archetype_emoji text,
  opponent_supporter_emoji text,
  created_at timestamptz,
  expires_at timestamptz,
  status text,
  winner_id uuid,
  creator_votes integer,
  opponent_votes integer,
  user_vote_for_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.creator_id,
    p1.username as creator_username,
    d.creator_position,
    d.creator_side,
    p1.archetype_emoji as creator_archetype_emoji,
    p1.supporter_emoji as creator_supporter_emoji,
    d.opponent_id,
    p2.username as opponent_username,
    d.opponent_position,
    d.opponent_side,
    p2.archetype_emoji as opponent_archetype_emoji,
    p2.supporter_emoji as opponent_supporter_emoji,
    d.created_at,
    d.expires_at,
    d.status,
    d.winner_id,
    d.creator_votes,
    d.opponent_votes,
    (
      SELECT vote_for_id 
      FROM debate_votes 
      WHERE debate_id = d.id AND voter_id = auth.uid()
      LIMIT 1
    ) as user_vote_for_id
  FROM public_debates d
  LEFT JOIN profiles p1 ON d.creator_id = p1.id
  LEFT JOIN profiles p2 ON d.opponent_id = p2.id
  WHERE d.id = p_debate_id;
END;
$$;

-- Function to get pending debate invites for a user
CREATE OR REPLACE FUNCTION get_pending_debate_invites()
RETURNS TABLE (
  id uuid,
  title text,
  creator_id uuid,
  creator_username text,
  creator_position text,
  creator_side text,
  opponent_side text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.creator_id,
    p.username as creator_username,
    d.creator_position,
    d.creator_side,
    d.opponent_side,
    d.created_at
  FROM public_debates d
  LEFT JOIN profiles p ON d.creator_id = p.id
  WHERE d.status = 'pending'
    AND d.opponent_email = auth.email()
    AND d.opponent_id IS NULL;
END;
$$;

-- Function to get completed debates with winners
CREATE OR REPLACE FUNCTION get_completed_debates()
RETURNS TABLE (
  id uuid,
  title text,
  creator_id uuid,
  creator_username text,
  creator_position text,
  creator_side text,
  creator_archetype_emoji text,
  creator_supporter_emoji text,
  opponent_id uuid,
  opponent_username text,
  opponent_position text,
  opponent_side text,
  opponent_archetype_emoji text,
  opponent_supporter_emoji text,
  created_at timestamptz,
  expires_at timestamptz,
  status text,
  winner_id uuid,
  winner_username text,
  creator_votes integer,
  opponent_votes integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.creator_id,
    p1.username as creator_username,
    d.creator_position,
    d.creator_side,
    p1.archetype_emoji as creator_archetype_emoji,
    p1.supporter_emoji as creator_supporter_emoji,
    d.opponent_id,
    p2.username as opponent_username,
    d.opponent_position,
    d.opponent_side,
    p2.archetype_emoji as opponent_archetype_emoji,
    p2.supporter_emoji as opponent_supporter_emoji,
    d.created_at,
    d.expires_at,
    d.status,
    d.winner_id,
    CASE 
      WHEN d.winner_id = d.creator_id THEN p1.username
      WHEN d.winner_id = d.opponent_id THEN p2.username
      ELSE NULL
    END as winner_username,
    d.creator_votes,
    d.opponent_votes
  FROM public_debates d
  LEFT JOIN profiles p1 ON d.creator_id = p1.id
  LEFT JOIN profiles p2 ON d.opponent_id = p2.id
  WHERE d.status = 'complete'
  ORDER BY d.expires_at DESC;
END;
$$;

-- Function to cast a vote
CREATE OR REPLACE FUNCTION cast_debate_vote(
  p_debate_id uuid,
  p_vote_for_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  debate_record RECORD;
  vote_exists boolean;
  is_creator boolean;
  is_opponent boolean;
BEGIN
  -- Get debate info
  SELECT * INTO debate_record
  FROM public_debates
  WHERE id = p_debate_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Debate not found';
  END IF;
  
  -- Check if debate is active
  IF debate_record.status != 'active' THEN
    RAISE EXCEPTION 'Debate is not active';
  END IF;
  
  -- Check if user is creator or opponent
  is_creator := (auth.uid() = debate_record.creator_id);
  is_opponent := (auth.uid() = debate_record.opponent_id);
  
  IF is_creator OR is_opponent THEN
    RAISE EXCEPTION 'Cannot vote on your own debate';
  END IF;
  
  -- Check if vote is for creator or opponent
  IF p_vote_for_id != debate_record.creator_id AND p_vote_for_id != debate_record.opponent_id THEN
    RAISE EXCEPTION 'Invalid vote target';
  END IF;
  
  -- Check if user already voted
  SELECT EXISTS(
    SELECT 1 FROM debate_votes
    WHERE debate_id = p_debate_id AND voter_id = auth.uid()
  ) INTO vote_exists;
  
  -- If vote exists, update it
  IF vote_exists THEN
    UPDATE debate_votes
    SET vote_for_id = p_vote_for_id
    WHERE debate_id = p_debate_id AND voter_id = auth.uid();
  ELSE
    -- Insert new vote
    INSERT INTO debate_votes (debate_id, voter_id, vote_for_id)
    VALUES (p_debate_id, auth.uid(), p_vote_for_id);
  END IF;
  
  -- Update vote counts
  UPDATE public_debates
  SET 
    creator_votes = (
      SELECT COUNT(*) FROM debate_votes
      WHERE debate_id = p_debate_id AND vote_for_id = creator_id
    ),
    opponent_votes = (
      SELECT COUNT(*) FROM debate_votes
      WHERE debate_id = p_debate_id AND vote_for_id = opponent_id
    )
  WHERE id = p_debate_id;
  
  RETURN true;
END;
$$;

-- Function to respond to a debate invite
CREATE OR REPLACE FUNCTION respond_to_debate_invite(
  p_debate_id uuid,
  p_position text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  debate_record RECORD;
  expires_at_date timestamptz;
BEGIN
  -- Get debate info
  SELECT * INTO debate_record
  FROM public_debates
  WHERE id = p_debate_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Debate not found';
  END IF;
  
  -- Check if user is the invited opponent
  IF auth.email() != debate_record.opponent_email THEN
    RAISE EXCEPTION 'Not authorized to respond to this debate';
  END IF;
  
  -- Check if debate is still pending
  IF debate_record.status != 'pending' THEN
    RAISE EXCEPTION 'Debate is no longer pending';
  END IF;
  
  -- Calculate expiration date (7 days from now)
  expires_at_date := now() + interval '7 days';
  
  -- Update debate with opponent's response
  UPDATE public_debates
  SET 
    opponent_id = auth.uid(),
    opponent_position = p_position,
    status = 'active',
    expires_at = expires_at_date
  WHERE id = p_debate_id;
  
  RETURN true;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS public_debates_status_idx ON public_debates(status);
CREATE INDEX IF NOT EXISTS public_debates_creator_id_idx ON public_debates(creator_id);
CREATE INDEX IF NOT EXISTS public_debates_opponent_id_idx ON public_debates(opponent_id);
CREATE INDEX IF NOT EXISTS public_debates_opponent_email_idx ON public_debates(opponent_email);
CREATE INDEX IF NOT EXISTS public_debates_expires_at_idx ON public_debates(expires_at);
CREATE INDEX IF NOT EXISTS debate_votes_debate_id_idx ON debate_votes(debate_id);
CREATE INDEX IF NOT EXISTS debate_votes_voter_id_idx ON debate_votes(voter_id);
CREATE INDEX IF NOT EXISTS debate_votes_vote_for_id_idx ON debate_votes(vote_for_id);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_active_debates() TO authenticated;
GRANT EXECUTE ON FUNCTION get_debate_by_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_debate_invites() TO authenticated;
GRANT EXECUTE ON FUNCTION get_completed_debates() TO authenticated;
GRANT EXECUTE ON FUNCTION cast_debate_vote(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION respond_to_debate_invite(uuid, text) TO authenticated;