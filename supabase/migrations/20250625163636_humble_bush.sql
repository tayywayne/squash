/*
  # Create Conflict Confidence Quests System

  1. New Tables
    - `quests` - Main quest definitions
      - `id` (uuid, primary key)
      - `title` (text) - Quest title
      - `description` (text) - Quest description
      - `emoji` (text) - Visual representation
      - `reward_cred` (int) - SquashCred points awarded
      - `unlocks_tool` (text, nullable) - Optional tool unlocked
      - `difficulty` (text) - easy, medium, hard
      - `theme` (text) - Category/theme of the quest
      - `created_at` (timestamp)
      - `is_active` (boolean) - Whether quest is available

    - `quest_steps` - Individual steps within quests
      - `id` (uuid, primary key)
      - `quest_id` (uuid, references quests)
      - `step_number` (int) - Order within quest
      - `title` (text) - Step title
      - `instruction` (text) - What user needs to do
      - `step_type` (text) - quiz, rewrite, choice
      - `options` (jsonb, nullable) - For quiz/choice types
      - `correct_answer` (text, nullable) - Expected response
      - `feedback_correct` (text) - Feedback for correct answer
      - `feedback_incorrect` (text) - Feedback for incorrect answer

    - `user_quests` - Track user progress on quests
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `quest_id` (uuid, references quests)
      - `started_at` (timestamp)
      - `completed_at` (timestamp, nullable)
      - `current_step` (int) - Current progress
      - `is_completed` (boolean)

    - `user_quest_steps` - Track user progress on individual steps
      - `id` (uuid, primary key)
      - `user_quest_id` (uuid, references user_quests)
      - `step_id` (uuid, references quest_steps)
      - `user_response` (text) - User's answer
      - `is_correct` (boolean) - Whether answer was correct
      - `completed_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for appropriate access control
    - Users can only see their own progress

  3. Functions
    - Function to start a quest
    - Function to submit a step response
    - Function to check quest completion
    - Function to award rewards upon completion
*/

-- Create quests table
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  emoji text NOT NULL,
  reward_cred int NOT NULL DEFAULT 10,
  unlocks_tool text,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  theme text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create quest_steps table
CREATE TABLE IF NOT EXISTS quest_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
  step_number int NOT NULL,
  title text NOT NULL,
  instruction text NOT NULL,
  step_type text NOT NULL CHECK (step_type IN ('quiz', 'rewrite', 'choice')),
  options jsonb,
  correct_answer text,
  feedback_correct text NOT NULL,
  feedback_incorrect text NOT NULL,
  UNIQUE(quest_id, step_number)
);

-- Create user_quests table
CREATE TABLE IF NOT EXISTS user_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quest_id uuid REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  current_step int DEFAULT 1,
  is_completed boolean DEFAULT false,
  UNIQUE(user_id, quest_id)
);

-- Create user_quest_steps table
CREATE TABLE IF NOT EXISTS user_quest_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_quest_id uuid REFERENCES user_quests(id) ON DELETE CASCADE NOT NULL,
  step_id uuid REFERENCES quest_steps(id) ON DELETE CASCADE NOT NULL,
  user_response text,
  is_correct boolean,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_quest_id, step_id)
);

-- Enable RLS
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_steps ENABLE ROW LEVEL SECURITY;

-- Policies for quests table
CREATE POLICY "Anyone can read active quests"
  ON quests
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policies for quest_steps table
CREATE POLICY "Anyone can read quest steps"
  ON quest_steps
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for user_quests table
CREATE POLICY "Users can read their own quest progress"
  ON user_quests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quest progress"
  ON user_quests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quest progress"
  ON user_quests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for user_quest_steps table
CREATE POLICY "Users can read their own quest step progress"
  ON user_quest_steps
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_quests
    WHERE user_quests.id = user_quest_steps.user_quest_id
    AND user_quests.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own quest step progress"
  ON user_quest_steps
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_quests
    WHERE user_quests.id = user_quest_steps.user_quest_id
    AND user_quests.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own quest step progress"
  ON user_quest_steps
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_quests
    WHERE user_quests.id = user_quest_steps.user_quest_id
    AND user_quests.user_id = auth.uid()
  ));

-- Function to start a quest
CREATE OR REPLACE FUNCTION start_quest(
  p_user_id uuid,
  p_quest_id uuid
)
RETURNS uuid AS $$
DECLARE
  v_user_quest_id uuid;
BEGIN
  -- Check if user has already started this quest
  SELECT id INTO v_user_quest_id
  FROM user_quests
  WHERE user_id = p_user_id AND quest_id = p_quest_id;
  
  -- If not started, create a new user_quest record
  IF v_user_quest_id IS NULL THEN
    INSERT INTO user_quests (user_id, quest_id)
    VALUES (p_user_id, p_quest_id)
    RETURNING id INTO v_user_quest_id;
  END IF;
  
  RETURN v_user_quest_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit a step response
CREATE OR REPLACE FUNCTION submit_quest_step(
  p_user_quest_id uuid,
  p_step_id uuid,
  p_user_response text
)
RETURNS jsonb AS $$
DECLARE
  v_step quest_steps;
  v_is_correct boolean;
  v_feedback text;
  v_quest_id uuid;
  v_user_id uuid;
  v_current_step int;
  v_next_step int;
  v_total_steps int;
  v_is_completed boolean := false;
  v_quest_completed boolean := false;
  v_reward_cred int;
  v_unlocks_tool text;
  v_quest_title text;
BEGIN
  -- Get step information
  SELECT * INTO v_step
  FROM quest_steps
  WHERE id = p_step_id;
  
  -- Determine if response is correct based on step type
  IF v_step.step_type = 'quiz' OR v_step.step_type = 'choice' THEN
    v_is_correct := p_user_response = v_step.correct_answer;
  ELSE
    -- For rewrite type, we'll consider it correct if they submitted something
    v_is_correct := p_user_response IS NOT NULL AND length(p_user_response) > 0;
  END IF;
  
  -- Set appropriate feedback
  IF v_is_correct THEN
    v_feedback := v_step.feedback_correct;
  ELSE
    v_feedback := v_step.feedback_incorrect;
  END IF;
  
  -- Insert or update user_quest_step
  INSERT INTO user_quest_steps (user_quest_id, step_id, user_response, is_correct)
  VALUES (p_user_quest_id, p_step_id, p_user_response, v_is_correct)
  ON CONFLICT (user_quest_id, step_id) 
  DO UPDATE SET 
    user_response = p_user_response,
    is_correct = v_is_correct,
    completed_at = now();
  
  -- Get quest information
  SELECT 
    uq.quest_id, 
    uq.user_id, 
    uq.current_step,
    q.reward_cred,
    q.unlocks_tool,
    q.title
  INTO 
    v_quest_id, 
    v_user_id, 
    v_current_step,
    v_reward_cred,
    v_unlocks_tool,
    v_quest_title
  FROM user_quests uq
  JOIN quests q ON uq.quest_id = q.id
  WHERE uq.id = p_user_quest_id;
  
  -- Get total steps in quest
  SELECT COUNT(*) INTO v_total_steps
  FROM quest_steps
  WHERE quest_id = v_quest_id;
  
  -- Calculate next step
  v_next_step := v_current_step + 1;
  
  -- Check if this completes the quest
  IF v_next_step > v_total_steps THEN
    v_quest_completed := true;
    
    -- Update user_quest to completed
    UPDATE user_quests
    SET 
      is_completed = true,
      completed_at = now()
    WHERE id = p_user_quest_id;
    
    -- Award SquashCred
    IF v_reward_cred > 0 THEN
      PERFORM award_squashcred(
        v_user_id, 
        v_reward_cred, 
        'Completed quest: ' || v_quest_title
      );
    END IF;
    
    -- Unlock achievement
    PERFORM unlock_user_achievement(
      v_user_id,
      'quest_' || v_quest_id,
      'Quest: ' || v_quest_title,
      COALESCE((SELECT emoji FROM quests WHERE id = v_quest_id), '🎯'),
      'Completed the "' || v_quest_title || '" quest'
    );
    
    -- TODO: Handle tool unlocking if needed
  ELSE
    -- Update current step
    UPDATE user_quests
    SET current_step = v_next_step
    WHERE id = p_user_quest_id;
  END IF;
  
  -- Return result
  RETURN jsonb_build_object(
    'is_correct', v_is_correct,
    'feedback', v_feedback,
    'quest_completed', v_quest_completed,
    'next_step', v_next_step,
    'total_steps', v_total_steps
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get available quests with progress
CREATE OR REPLACE FUNCTION get_available_quests(p_user_id uuid)
RETURNS TABLE (
  quest_id uuid,
  title text,
  description text,
  emoji text,
  reward_cred int,
  unlocks_tool text,
  difficulty text,
  theme text,
  is_started boolean,
  is_completed boolean,
  current_step int,
  total_steps int,
  progress_percentage int
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id as quest_id,
    q.title,
    q.description,
    q.emoji,
    q.reward_cred,
    q.unlocks_tool,
    q.difficulty,
    q.theme,
    uq.id IS NOT NULL as is_started,
    COALESCE(uq.is_completed, false) as is_completed,
    COALESCE(uq.current_step, 0) as current_step,
    (SELECT COUNT(*) FROM quest_steps qs WHERE qs.quest_id = q.id) as total_steps,
    CASE
      WHEN uq.is_completed THEN 100
      WHEN uq.id IS NULL THEN 0
      ELSE 
        ROUND(
          (COALESCE(uq.current_step, 1) - 1) * 100.0 / 
          NULLIF((SELECT COUNT(*) FROM quest_steps qs WHERE qs.quest_id = q.id), 0)
        )
    END as progress_percentage
  FROM quests q
  LEFT JOIN user_quests uq ON q.id = uq.quest_id AND uq.user_id = p_user_id
  WHERE q.is_active = true
  ORDER BY 
    COALESCE(uq.is_completed, false) ASC,
    COALESCE(uq.started_at, '2099-01-01'::timestamptz) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get quest details with steps
CREATE OR REPLACE FUNCTION get_quest_details(p_quest_id uuid, p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_quest jsonb;
  v_steps jsonb;
  v_user_quest jsonb;
  v_user_quest_id uuid;
BEGIN
  -- Get quest information
  SELECT jsonb_build_object(
    'id', q.id,
    'title', q.title,
    'description', q.description,
    'emoji', q.emoji,
    'reward_cred', q.reward_cred,
    'unlocks_tool', q.unlocks_tool,
    'difficulty', q.difficulty,
    'theme', q.theme
  ) INTO v_quest
  FROM quests q
  WHERE q.id = p_quest_id;
  
  -- Get user quest progress
  SELECT 
    uq.id,
    jsonb_build_object(
      'is_started', true,
      'is_completed', uq.is_completed,
      'current_step', uq.current_step,
      'started_at', uq.started_at,
      'completed_at', uq.completed_at
    ) INTO v_user_quest_id, v_user_quest
  FROM user_quests uq
  WHERE uq.quest_id = p_quest_id AND uq.user_id = p_user_id;
  
  -- If user hasn't started this quest
  IF v_user_quest IS NULL THEN
    v_user_quest := jsonb_build_object(
      'is_started', false,
      'is_completed', false,
      'current_step', 0
    );
  END IF;
  
  -- Get steps information
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', qs.id,
      'step_number', qs.step_number,
      'title', qs.title,
      'instruction', qs.instruction,
      'step_type', qs.step_type,
      'options', qs.options,
      'user_response', uqs.user_response,
      'is_correct', uqs.is_correct,
      'completed_at', uqs.completed_at,
      'is_completed', uqs.id IS NOT NULL
    ) ORDER BY qs.step_number
  ) INTO v_steps
  FROM quest_steps qs
  LEFT JOIN user_quest_steps uqs ON 
    qs.id = uqs.step_id AND 
    uqs.user_quest_id = v_user_quest_id
  WHERE qs.quest_id = p_quest_id;
  
  -- Return combined result
  RETURN jsonb_build_object(
    'quest', v_quest,
    'user_progress', v_user_quest,
    'steps', COALESCE(v_steps, '[]'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION start_quest(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_quest_step(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_quests(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_quest_details(uuid, uuid) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS quest_steps_quest_id_idx ON quest_steps(quest_id);
CREATE INDEX IF NOT EXISTS user_quests_user_id_idx ON user_quests(user_id);
CREATE INDEX IF NOT EXISTS user_quests_quest_id_idx ON user_quests(quest_id);
CREATE INDEX IF NOT EXISTS user_quest_steps_user_quest_id_idx ON user_quest_steps(user_quest_id);
CREATE INDEX IF NOT EXISTS user_quest_steps_step_id_idx ON user_quest_steps(step_id);