/*
  # Create conflicts and related tables

  1. New Tables
    - `conflicts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `user1_id` (uuid, references auth.users)
      - `user2_email` (text)
      - `user2_id` (uuid, nullable, references auth.users)
      - `status` (enum: pending, active, resolved, abandoned)
      - `user1_mood` (text)
      - `user1_raw_message` (text)
      - `user1_translated_message` (text, nullable)
      - `user2_raw_message` (text, nullable)
      - `user2_translated_message` (text, nullable)
      - `ai_summary` (text, nullable)
      - `ai_suggestion` (text, nullable)
      - `user1_satisfaction` (boolean, nullable)
      - `user2_satisfaction` (boolean, nullable)
      - `created_at` (timestamp)
      - `resolved_at` (timestamp, nullable)

  2. Security
    - Enable RLS on `conflicts` table
    - Add policies for users to read/write their own conflicts
*/

-- Create enum for conflict status
CREATE TYPE conflict_status AS ENUM ('pending', 'active', 'resolved', 'abandoned');

-- Create conflicts table
CREATE TABLE IF NOT EXISTS conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  user1_id uuid REFERENCES auth.users(id) NOT NULL,
  user2_email text NOT NULL,
  user2_id uuid REFERENCES auth.users(id),
  status conflict_status DEFAULT 'pending',
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

-- Enable RLS
ALTER TABLE conflicts ENABLE ROW LEVEL SECURITY;

-- Policies for conflicts table
CREATE POLICY "Users can read conflicts they're involved in"
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

CREATE POLICY "Users can update conflicts they're involved in"
  ON conflicts
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS conflicts_user1_id_idx ON conflicts(user1_id);
CREATE INDEX IF NOT EXISTS conflicts_user2_id_idx ON conflicts(user2_id);
CREATE INDEX IF NOT EXISTS conflicts_user2_email_idx ON conflicts(user2_email);
CREATE INDEX IF NOT EXISTS conflicts_status_idx ON conflicts(status);