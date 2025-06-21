/*
  # Create conflicts table and related schema

  1. New Tables
    - `conflicts`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `user1_id` (uuid, references auth.users)
      - `user2_email` (text, required)
      - `user2_id` (uuid, references auth.users, nullable)
      - `status` (text, default 'pending')
      - `user1_mood` (text, required)
      - `user1_raw_message` (text, required)
      - `user1_translated_message` (text, nullable)
      - `user2_raw_message` (text, nullable)
      - `user2_translated_message` (text, nullable)
      - `ai_summary` (text, nullable)
      - `ai_suggestion` (text, nullable)
      - `user1_satisfaction` (boolean, nullable)
      - `user2_satisfaction` (boolean, nullable)
      - `created_at` (timestamptz, default now())
      - `resolved_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on `conflicts` table
    - Add policies for users to read/write their own conflicts
    - Add policy for users to respond to conflicts where they are user2

  3. Indexes
    - Add indexes for efficient querying by user IDs and status
*/

-- Create conflicts table
CREATE TABLE IF NOT EXISTS conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  user1_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_email text NOT NULL,
  user2_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'resolved', 'abandoned')),
  user1_mood text NOT NULL,
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

-- Create policies for conflicts table
CREATE POLICY "Users can view conflicts they are involved in"
  ON conflicts
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id OR 
    auth.email() = user2_email
  );

CREATE POLICY "Users can create conflicts"
  ON conflicts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update conflicts they are involved in"
  ON conflicts
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id OR 
    auth.email() = user2_email
  )
  WITH CHECK (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id OR 
    auth.email() = user2_email
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conflicts_user1_id ON conflicts(user1_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_user2_id ON conflicts(user2_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_user2_email ON conflicts(user2_email);
CREATE INDEX IF NOT EXISTS idx_conflicts_status ON conflicts(status);
CREATE INDEX IF NOT EXISTS idx_conflicts_created_at ON conflicts(created_at DESC);