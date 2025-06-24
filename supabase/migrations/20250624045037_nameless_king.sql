/*
  # Create SquashCred Points System

  1. New Tables
    - `user_points`
      - `user_id` (uuid, primary key, references auth.users)
      - `squashcred` (int, default 0)
      - `updated_at` (timestamp, default now())
    
    - `squashcred_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `amount` (int)
      - `reason` (text)
      - `created_at` (timestamp, default now())

  2. Functions
    - `award_squashcred(user_id, amount, reason)` - Awards or deducts points
    - `get_user_squashcred(user_id)` - Gets current balance
    - `get_squashcred_tier(points)` - Gets tier info for points amount

  3. Security
    - Enable RLS on both tables
    - Users can read their own points and events
    - System functions can modify points

  4. Constraints
    - Points cannot go below -100
    - Points cannot exceed 100,000
*/

-- Create user_points table
CREATE TABLE IF NOT EXISTS user_points (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  squashcred int DEFAULT 0 CHECK (squashcred >= -100 AND squashcred <= 100000),
  updated_at timestamptz DEFAULT now()
);

-- Create squashcred_events table for audit log
CREATE TABLE IF NOT EXISTS squashcred_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount int NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE squashcred_events ENABLE ROW LEVEL SECURITY;

-- Policies for user_points
CREATE POLICY "Users can read their own points"
  ON user_points
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read all points for leaderboard"
  ON user_points
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for squashcred_events
CREATE POLICY "Users can read their own events"
  ON squashcred_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to award or deduct SquashCred points
CREATE OR REPLACE FUNCTION public.award_squashcred(
  p_user_id uuid,
  p_amount int,
  p_reason text
)
RETURNS int AS $$
DECLARE
  current_points int;
  new_points int;
BEGIN
  -- Get current points or create record if doesn't exist
  INSERT INTO user_points (user_id, squashcred)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT squashcred INTO current_points
  FROM user_points
  WHERE user_id = p_user_id;
  
  -- Calculate new points with constraints
  new_points := current_points + p_amount;
  new_points := GREATEST(-100, LEAST(100000, new_points));
  
  -- Update points
  UPDATE user_points
  SET squashcred = new_points,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log the event (only if points actually changed)
  IF new_points != current_points THEN
    INSERT INTO squashcred_events (user_id, amount, reason)
    VALUES (p_user_id, new_points - current_points, p_reason);
  END IF;
  
  RETURN new_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current SquashCred balance
CREATE OR REPLACE FUNCTION public.get_user_squashcred(p_user_id uuid)
RETURNS int AS $$
DECLARE
  points int;
BEGIN
  SELECT squashcred INTO points
  FROM user_points
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(points, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tier information for a points amount
CREATE OR REPLACE FUNCTION public.get_squashcred_tier(p_points int)
RETURNS TABLE (
  tier_emoji text,
  tier_title text,
  tier_range text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN p_points <= -51 THEN '🚨'
      WHEN p_points BETWEEN -50 AND -1 THEN '⚠️'
      WHEN p_points = 0 THEN '🧊'
      WHEN p_points BETWEEN 1 AND 99 THEN '🌱'
      WHEN p_points BETWEEN 100 AND 499 THEN '💬'
      WHEN p_points BETWEEN 500 AND 999 THEN '🛠️'
      WHEN p_points BETWEEN 1000 AND 4999 THEN '🎭'
      WHEN p_points BETWEEN 5000 AND 9999 THEN '🧘‍♀️'
      WHEN p_points BETWEEN 10000 AND 24999 THEN '⚖️'
      WHEN p_points BETWEEN 25000 AND 49999 THEN '👑'
      WHEN p_points BETWEEN 50000 AND 99999 THEN '🌈'
      WHEN p_points = 100000 THEN '🧠'
      ELSE '🧊'
    END as tier_emoji,
    CASE 
      WHEN p_points <= -51 THEN 'Walking Red Flag'
      WHEN p_points BETWEEN -50 AND -1 THEN 'Drama Magnet'
      WHEN p_points = 0 THEN 'Emotionally Neutral'
      WHEN p_points BETWEEN 1 AND 99 THEN 'Conflict Newbie'
      WHEN p_points BETWEEN 100 AND 499 THEN 'Squash Apprentice'
      WHEN p_points BETWEEN 500 AND 999 THEN 'Conflict Fixer'
      WHEN p_points BETWEEN 1000 AND 4999 THEN 'Drama Diplomat'
      WHEN p_points BETWEEN 5000 AND 9999 THEN 'Deescalation Expert'
      WHEN p_points BETWEEN 10000 AND 24999 THEN 'Chaos Whisperer'
      WHEN p_points BETWEEN 25000 AND 49999 THEN 'Peace Overlord'
      WHEN p_points BETWEEN 50000 AND 99999 THEN 'Enlightened Resolver'
      WHEN p_points = 100000 THEN 'Legendary Squasher'
      ELSE 'Emotionally Neutral'
    END as tier_title,
    CASE 
      WHEN p_points <= -51 THEN '≤ -51 points'
      WHEN p_points BETWEEN -50 AND -1 THEN '-50 to -1 points'
      WHEN p_points = 0 THEN '0 points'
      WHEN p_points BETWEEN 1 AND 99 THEN '1-99 points'
      WHEN p_points BETWEEN 100 AND 499 THEN '100-499 points'
      WHEN p_points BETWEEN 500 AND 999 THEN '500-999 points'
      WHEN p_points BETWEEN 1000 AND 4999 THEN '1,000-4,999 points'
      WHEN p_points BETWEEN 5000 AND 9999 THEN '5,000-9,999 points'
      WHEN p_points BETWEEN 10000 AND 24999 THEN '10,000-24,999 points'
      WHEN p_points BETWEEN 25000 AND 49999 THEN '25,000-49,999 points'
      WHEN p_points BETWEEN 50000 AND 99999 THEN '50,000-99,999 points'
      WHEN p_points = 100000 THEN '100,000 points (MAX)'
      ELSE '0 points'
    END as tier_range;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user points with tier info
CREATE OR REPLACE FUNCTION public.get_user_points_with_tier(p_user_id uuid)
RETURNS TABLE (
  squashcred int,
  tier_emoji text,
  tier_title text,
  tier_range text
) AS $$
DECLARE
  user_points int;
BEGIN
  SELECT get_user_squashcred(p_user_id) INTO user_points;
  
  RETURN QUERY
  SELECT 
    user_points as squashcred,
    t.tier_emoji,
    t.tier_title,
    t.tier_range
  FROM get_squashcred_tier(user_points) t;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.award_squashcred(uuid, int, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_squashcred(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_squashcred_tier(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_points_with_tier(uuid) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_points_squashcred_idx ON user_points(squashcred);
CREATE INDEX IF NOT EXISTS squashcred_events_user_id_idx ON squashcred_events(user_id);
CREATE INDEX IF NOT EXISTS squashcred_events_created_at_idx ON squashcred_events(created_at);

-- Trigger to update updated_at timestamp
CREATE TRIGGER on_user_points_updated
  BEFORE UPDATE ON user_points
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();