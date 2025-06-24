/*
  # Create user achievements system

  1. New Tables
    - `user_achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `code` (text, internal achievement identifier)
      - `name` (text, display name)
      - `emoji` (text, achievement emoji)
      - `description` (text, tooltip description)
      - `unlocked_at` (timestamp)

  2. Security
    - Enable RLS on `user_achievements` table
    - Add policies for reading and system insertion

  3. Functions
    - Function to unlock achievement
    - Function to get user achievements
    - Function to check if user has achievement
*/

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  emoji text NOT NULL,
  description text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, code)
);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for user_achievements table
CREATE POLICY "Anyone can read user achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert user achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to unlock achievement
CREATE OR REPLACE FUNCTION public.unlock_user_achievement(
  p_user_id uuid,
  p_code text,
  p_name text,
  p_emoji text,
  p_description text
)
RETURNS boolean AS $$
DECLARE
  achievement_exists boolean;
BEGIN
  -- Check if achievement already exists
  SELECT EXISTS(
    SELECT 1 FROM user_achievements 
    WHERE user_id = p_user_id AND code = p_code
  ) INTO achievement_exists;
  
  -- If achievement doesn't exist, create it
  IF NOT achievement_exists THEN
    INSERT INTO user_achievements (user_id, code, name, emoji, description)
    VALUES (p_user_id, p_code, p_name, p_emoji, p_description);
    RETURN true; -- New achievement unlocked
  END IF;
  
  RETURN false; -- Achievement already existed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's achievements
CREATE OR REPLACE FUNCTION public.get_user_achievements(p_user_id uuid)
RETURNS TABLE (
  code text,
  name text,
  emoji text,
  description text,
  unlocked_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.code,
    ua.name,
    ua.emoji,
    ua.description,
    ua.unlocked_at
  FROM user_achievements ua
  WHERE ua.user_id = p_user_id
  ORDER BY ua.unlocked_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific achievement
CREATE OR REPLACE FUNCTION public.user_has_achievement(p_user_id uuid, p_code text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM user_achievements 
    WHERE user_id = p_user_id AND code = p_code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.unlock_user_achievement(uuid, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_achievements(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_achievement(uuid, text) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS user_achievements_code_idx ON user_achievements(code);
CREATE INDEX IF NOT EXISTS user_achievements_unlocked_at_idx ON user_achievements(unlocked_at);