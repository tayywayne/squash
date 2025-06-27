/*
  # Fix submit_quest_step function emoji reference

  1. Problem
    - The submit_quest_step function is trying to access step_record.emoji
    - The quest_steps table doesn't have an emoji column
    - The emoji field exists in the quests table

  2. Solution
    - Update the submit_quest_step function to properly join with quests table
    - Reference quests.emoji instead of step_record.emoji
*/

-- Drop the existing function first
DROP FUNCTION IF EXISTS submit_quest_step(uuid, uuid, text);

-- Recreate the function with proper emoji reference
CREATE OR REPLACE FUNCTION submit_quest_step(
  p_user_quest_id uuid,
  p_step_id uuid,
  p_user_response text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  step_record RECORD;
  quest_record RECORD;
  user_quest_record RECORD;
  is_correct_answer boolean := false;
  next_step_number integer;
  total_steps integer;
  quest_completed boolean := false;
BEGIN
  -- Get the user quest record
  SELECT * INTO user_quest_record
  FROM user_quests
  WHERE id = p_user_quest_id AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User quest not found or access denied';
  END IF;

  -- Get the step record with quest info
  SELECT qs.*, q.emoji, q.title as quest_title, q.reward_cred
  INTO step_record
  FROM quest_steps qs
  JOIN quests q ON qs.quest_id = q.id
  WHERE qs.id = p_step_id AND qs.quest_id = user_quest_record.quest_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quest step not found';
  END IF;

  -- Check if step is already completed
  IF EXISTS (
    SELECT 1 FROM user_quest_steps 
    WHERE user_quest_id = p_user_quest_id AND step_id = p_step_id
  ) THEN
    RAISE EXCEPTION 'Step already completed';
  END IF;

  -- Determine if answer is correct based on step type
  CASE step_record.step_type
    WHEN 'quiz' THEN
      is_correct_answer := (p_user_response = step_record.correct_answer);
    WHEN 'choice' THEN
      is_correct_answer := (p_user_response = step_record.correct_answer);
    WHEN 'rewrite' THEN
      -- For rewrite steps, we'll consider any non-empty response as correct
      is_correct_answer := (length(trim(p_user_response)) > 0);
    ELSE
      is_correct_answer := true;
  END CASE;

  -- Insert the user's step completion
  INSERT INTO user_quest_steps (user_quest_id, step_id, user_response, is_correct)
  VALUES (p_user_quest_id, p_step_id, p_user_response, is_correct_answer);

  -- Get total number of steps for this quest
  SELECT COUNT(*) INTO total_steps
  FROM quest_steps
  WHERE quest_id = user_quest_record.quest_id;

  -- Get next step number
  next_step_number := step_record.step_number + 1;

  -- Check if quest is completed
  IF next_step_number > total_steps THEN
    quest_completed := true;
    
    -- Update user quest as completed
    UPDATE user_quests
    SET is_completed = true, completed_at = now(), current_step = total_steps
    WHERE id = p_user_quest_id;
    
    -- Award SquashCred
    INSERT INTO squashcred_events (user_id, amount, reason)
    VALUES (auth.uid(), step_record.reward_cred, 'Completed quest: ' || step_record.quest_title);
    
    -- Update user points
    INSERT INTO user_points (user_id, squashcred)
    VALUES (auth.uid(), step_record.reward_cred)
    ON CONFLICT (user_id)
    DO UPDATE SET 
      squashcred = user_points.squashcred + step_record.reward_cred,
      updated_at = now();
  ELSE
    -- Update current step
    UPDATE user_quests
    SET current_step = next_step_number
    WHERE id = p_user_quest_id;
  END IF;

  -- Return response
  RETURN jsonb_build_object(
    'success', true,
    'is_correct', is_correct_answer,
    'feedback', CASE 
      WHEN is_correct_answer THEN step_record.feedback_correct 
      ELSE step_record.feedback_incorrect 
    END,
    'quest_completed', quest_completed,
    'next_step_number', CASE WHEN quest_completed THEN null ELSE next_step_number END,
    'emoji', step_record.emoji
  );
END;
$$;