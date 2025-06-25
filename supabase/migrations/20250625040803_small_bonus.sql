/*
  # Add profile_updates tracking for achievements

  1. New Tables
    - `profile_updates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `update_type` (text, e.g., 'avatar', 'username', 'general')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `profile_updates` table
    - Add policies for reading and inserting records

  3. Functions
    - Function to log profile updates
    - Trigger to automatically log profile updates

  4. Tracking
    - Track profile updates for achievement unlocking
    - Track leaderboard views for achievement unlocking
*/

-- Create profile_updates table
CREATE TABLE IF NOT EXISTS profile_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  update_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profile_updates ENABLE ROW LEVEL SECURITY;

-- Policies for profile_updates table
CREATE POLICY "Users can read their own profile updates"
  ON profile_updates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert profile updates"
  ON profile_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to log profile update
CREATE OR REPLACE FUNCTION public.log_profile_update(
  p_user_id uuid,
  p_update_type text
)
RETURNS void AS $$
BEGIN
  INSERT INTO profile_updates (user_id, update_type)
  VALUES (p_user_id, p_update_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to automatically log profile updates
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS trigger AS $$
BEGIN
  -- Determine update type based on which columns changed
  IF OLD.avatar_url IS DISTINCT FROM NEW.avatar_url THEN
    PERFORM public.log_profile_update(NEW.id, 'avatar');
  END IF;
  
  IF OLD.username IS DISTINCT FROM NEW.username THEN
    PERFORM public.log_profile_update(NEW.id, 'username');
  END IF;
  
  -- For any other changes, log as general update
  IF (
    OLD.first_name IS DISTINCT FROM NEW.first_name OR
    OLD.last_name IS DISTINCT FROM NEW.last_name
  ) THEN
    PERFORM public.log_profile_update(NEW.id, 'general');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_updated_log ON profiles;
CREATE TRIGGER on_profile_updated_log
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (
    OLD.avatar_url IS DISTINCT FROM NEW.avatar_url OR
    OLD.username IS DISTINCT FROM NEW.username OR
    OLD.first_name IS DISTINCT FROM NEW.first_name OR
    OLD.last_name IS DISTINCT FROM NEW.last_name
  )
  EXECUTE FUNCTION public.handle_profile_update();

-- Create leaderboard_views table to track achievement
CREATE TABLE IF NOT EXISTS leaderboard_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE leaderboard_views ENABLE ROW LEVEL SECURITY;

-- Policies for leaderboard_views table
CREATE POLICY "Users can read their own leaderboard views"
  ON leaderboard_views
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leaderboard views"
  ON leaderboard_views
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to log leaderboard view
CREATE OR REPLACE FUNCTION public.log_leaderboard_view(
  p_user_id uuid
)
RETURNS void AS $$
BEGIN
  INSERT INTO leaderboard_views (user_id)
  VALUES (p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count user's leaderboard views
CREATE OR REPLACE FUNCTION public.get_leaderboard_view_count(
  p_user_id uuid
)
RETURNS bigint AS $$
DECLARE
  view_count bigint;
BEGIN
  SELECT COUNT(*) INTO view_count
  FROM leaderboard_views
  WHERE user_id = p_user_id;
  
  RETURN view_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.log_profile_update(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_leaderboard_view(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_view_count(uuid) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profile_updates_user_id_idx ON profile_updates(user_id);
CREATE INDEX IF NOT EXISTS profile_updates_created_at_idx ON profile_updates(created_at);
CREATE INDEX IF NOT EXISTS leaderboard_views_user_id_idx ON leaderboard_views(user_id);
CREATE INDEX IF NOT EXISTS leaderboard_views_created_at_idx ON leaderboard_views(created_at);