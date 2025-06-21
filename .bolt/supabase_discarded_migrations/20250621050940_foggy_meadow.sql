/*
  # Create conflicts table for conflict resolution system

  1. New Tables
    - `conflicts`
      - `id` (uuid, primary key)
      - `title` (text, conflict title)
      - `user1_id` (uuid, references auth.users)
      - `user2_email` (text, email of second party)
      - `user2_id` (uuid, references auth.users, nullable)
      - `status` (text, conflict status)
      - `user1_mood` (text, mood of first user)
      - `user1_raw_message` (text, original message from user1)
      - `user1_translated_message` (text, AI-processed message)
      - `user2_raw_message` (text, original message from user2, nullable)
      - `user2_translated_message` (text, AI-processed message, nullable)
      - `ai_summary` (text, AI-generated summary, nullable)
      - `ai_suggestion` (text, AI-generated suggestion, nullable)
      - `user1_satisfaction` (boolean, user1 satisfaction rating, nullable)
      - `user2_satisfaction` (boolean, user2 satisfaction rating, nullable)
      - `created_at` (timestamptz, creation timestamp)
      - `resolved_at` (timestamptz, resolution timestamp, nullable)

  2. Security
    - Enable RLS on `conflicts` table
    - Add policies for users to read/write their own conflicts
    - Add policy for invited users to access conflicts via email
*/

CREATE TABLE IF NOT EXISTS conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  user1_id uuid REFERENCES auth.users(id) NOT NULL,
  user2_email text NOT NULL,
  user2_id uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'resolved', 'abandoned')),
  user1_mood text NOT NULL DEFAULT 'neutral',
  user1_raw_message text NOT NULL,
  user1_translated_message text,
  user2_raw_message text,
  user2_translated_message text,
  ai_summary text,
  ai_suggestion text,
  user1_satisfaction boolean,
  user2_satisfaction boolean,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE conflicts ENABLE ROW LEVEL SECURITY;

-- Policy for user1 to read/write their own conflicts
CREATE POLICY "Users can manage conflicts they created"
  ON conflicts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user1_id);

-- Policy for user2 to read/write conflicts they're invited to
CREATE POLICY "Users can manage conflicts they're invited to"
  ON conflicts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user2_id);

-- Policy for users to read conflicts where they're invited by email
CREATE POLICY "Users can read conflicts by email invitation"
  ON conflicts
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = user2_email AND user2_id IS NULL
  );

-- Policy for users to update conflicts where they're invited by email
CREATE POLICY "Users can respond to conflicts by email invitation"
  ON conflicts
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = user2_email AND user2_id IS NULL
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conflicts_user1_id ON conflicts(user1_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_user2_id ON conflicts(user2_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_user2_email ON conflicts(user2_email);
CREATE INDEX IF NOT EXISTS idx_conflicts_status ON conflicts(status);
CREATE INDEX IF NOT EXISTS idx_conflicts_created_at ON conflicts(created_at);