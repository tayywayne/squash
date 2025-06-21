/*
  # Create conflicts table

  1. New Tables
    - `conflicts`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `title` (text, not null)
      - `user1_id` (uuid, foreign key to auth.users)
      - `user2_email` (text, not null)
      - `user2_id` (uuid, foreign key to auth.users, nullable)
      - `status` (text with check constraint)
      - `user1_mood` (text, not null)
      - `user1_raw_message` (text, not null)
      - `user1_translated_message` (text, nullable)
      - `user2_raw_message` (text, nullable)
      - `user2_translated_message` (text, nullable)
      - `ai_summary` (text, nullable)
      - `ai_suggestion` (text, nullable)
      - `user1_satisfaction` (boolean, nullable)
      - `user2_satisfaction` (boolean, nullable)
      - `resolved_at` (timestamp with time zone, nullable)

  2. Security
    - Enable RLS on `conflicts` table
    - Add policy for users to view their own conflicts
    - Add policy for users to create conflicts
    - Add policy for users to update their own conflicts

  3. Constraints
    - Status field restricted to: 'pending', 'active', 'resolved', 'abandoned'
    - Foreign key constraints for user references
    - Cascade delete for user1, set null for user2
*/

CREATE TABLE IF NOT EXISTS public.conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  title text NOT NULL,
  user1_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_email text NOT NULL,
  user2_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'active', 'resolved', 'abandoned')),
  user1_mood text NOT NULL,
  user1_raw_message text NOT NULL,
  user1_translated_message text,
  user2_raw_message text,
  user2_translated_message text,
  ai_summary text,
  ai_suggestion text,
  user1_satisfaction boolean,
  user2_satisfaction boolean,
  resolved_at timestamptz
);

ALTER TABLE public.conflicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conflicts" 
  ON public.conflicts
  FOR SELECT 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conflicts" 
  ON public.conflicts
  FOR INSERT 
  WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update their own conflicts" 
  ON public.conflicts
  FOR UPDATE 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id) 
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conflicts_user1_id ON public.conflicts(user1_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_user2_id ON public.conflicts(user2_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_user2_email ON public.conflicts(user2_email);
CREATE INDEX IF NOT EXISTS idx_conflicts_status ON public.conflicts(status);
CREATE INDEX IF NOT EXISTS idx_conflicts_created_at ON public.conflicts(created_at DESC);