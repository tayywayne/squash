/*
  # Create archetype achievements system

  1. New Tables
    - `archetype_achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `archetype_name` (text)
      - `emoji` (text)
      - `unlocked_at` (timestamp)
      - Unique constraint on (user_id, archetype_name)

  2. Security
    - Enable RLS on `archetype_achievements` table
    - Add policies for reading achievements
    - Users can view their own and others' achievements

  3. Functions
    - Function to unlock new archetype achievements
    - Function to get user's archetype collection
*/

-- Create archetype_achievements table
CREATE TABLE IF NOT EXISTS archetype_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  archetype_name text NOT NULL,
  emoji text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, archetype_name)
);

-- Enable RLS
ALTER TABLE archetype_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for archetype_achievements table
CREATE POLICY "Anyone can read archetype achievements"
  ON archetype_achievements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert archetype achievements"
  ON archetype_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to unlock archetype achievement
CREATE OR REPLACE FUNCTION public.unlock_archetype_achievement(
  p_user_id uuid,
  p_archetype_name text,
  p_emoji text
)
RETURNS boolean AS $$
DECLARE
  achievement_exists boolean;
BEGIN
  -- Check if achievement already exists
  SELECT EXISTS(
    SELECT 1 FROM archetype_achievements 
    WHERE user_id = p_user_id AND archetype_name = p_archetype_name
  ) INTO achievement_exists;
  
  -- If achievement doesn't exist, create it
  IF NOT achievement_exists THEN
    INSERT INTO archetype_achievements (user_id, archetype_name, emoji)
    VALUES (p_user_id, p_archetype_name, p_emoji);
    RETURN true; -- New achievement unlocked
  END IF;
  
  RETURN false; -- Achievement already existed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's archetype achievements
CREATE OR REPLACE FUNCTION public.get_user_archetype_achievements(p_user_id uuid)
RETURNS TABLE (
  archetype_name text,
  emoji text,
  unlocked_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aa.archetype_name,
    aa.emoji,
    aa.unlocked_at
  FROM archetype_achievements aa
  WHERE aa.user_id = p_user_id
  ORDER BY aa.unlocked_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.unlock_archetype_achievement(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_archetype_achievements(uuid) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS archetype_achievements_user_id_idx ON archetype_achievements(user_id);
CREATE INDEX IF NOT EXISTS archetype_achievements_unlocked_at_idx ON archetype_achievements(unlocked_at);