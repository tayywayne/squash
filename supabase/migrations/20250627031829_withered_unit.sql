/*
  # Fix Quest Achievements

  1. Changes
    - Update the `submit_quest_step` function to return whether a quest achievement was newly unlocked
    - Add `is_quest_achievement_unlocked` boolean to the return JSON
    - Add `quest_id` to the return JSON for client-side achievement handling
    - Add `quest_title` to the return JSON for better achievement messages

  2. Security
    - Maintains existing security model with SECURITY DEFINER
    - No changes to RLS policies
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS submit_quest_step(UUID, UUID, TEXT);

-- Recreate the function with achievement unlocking information
CREATE OR REPLACE FUNCTION submit_quest_step(
  p_user_quest_id UUID,
  p_step_id UUID,
  p_user_response TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  step_record RECORD;
  user_quest_record RECORD;
  is_correct BOOLEAN;
  feedback TEXT;
  next_step INTEGER;
  total_steps INTEGER;
  quest_completed BOOLEAN := false;
  achievement_result RECORD;
  is_achievement_unlocked BOOLEAN := false;
  achievement_code TEXT;
BEGIN
  -- Get step details
  SELECT qs.*, q.reward_cred, q.id as quest_id, q.title as quest_title, q.difficulty
  INTO step_record
  FROM quest_steps qs
  JOIN quests q ON qs.quest_id = q.id
  WHERE qs.id = p_step_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quest step not found';
  END IF;

  -- Get user quest details
  SELECT * INTO user_quest_record
  FROM user_quests
  WHERE id = p_user_quest_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User quest not found';
  END IF;

  -- Check if answer is correct
  IF step_record.step_type = 'quiz' OR step_record.step_type = 'choice' THEN
    is_correct := (p_user_response = step_record.correct_answer);
  ELSE
    -- For rewrite steps, we'll consider them correct for now
    is_correct := true;
  END IF;

  -- Set feedback
  IF is_correct THEN
    feedback := step_record.feedback_correct;
  ELSE
    feedback := step_record.feedback_incorrect;
  END IF;

  -- Insert or update user quest step
  INSERT INTO user_quest_steps (user_quest_id, step_id, user_response, is_correct)
  VALUES (p_user_quest_id, p_step_id, p_user_response, is_correct)
  ON CONFLICT (user_quest_id, step_id)
  DO UPDATE SET 
    user_response = EXCLUDED.user_response,
    is_correct = EXCLUDED.is_correct,
    completed_at = now();

  -- Get total steps for this quest
  SELECT COUNT(*) INTO total_steps
  FROM quest_steps
  WHERE quest_id = step_record.quest_id;

  -- Calculate next step
  next_step := step_record.step_number + 1;

  -- Check if quest is completed
  IF next_step > total_steps THEN
    quest_completed := true;
    next_step := total_steps;

    -- Mark quest as completed
    UPDATE user_quests
    SET is_completed = true, completed_at = now()
    WHERE id = p_user_quest_id;

    -- Award SquashCred for quest completion
    PERFORM award_squashcred(
      user_quest_record.user_id, 
      step_record.reward_cred, 
      'Completed quest: ' || step_record.quest_title
    );
    
    -- Create achievement code based on quest ID
    achievement_code := 'quest_' || step_record.quest_id;
    
    -- Unlock achievement and capture the result
    SELECT * FROM unlock_user_achievement(
      user_quest_record.user_id,
      achievement_code,
      'Quest: ' || step_record.quest_title,
      step_record.emoji,
      'Completed the "' || step_record.quest_title || '" quest'
    ) INTO achievement_result;
    
    -- Store whether this was a new achievement
    is_achievement_unlocked := achievement_result;
  ELSE
    -- Update current step
    UPDATE user_quests
    SET current_step = next_step
    WHERE id = p_user_quest_id;
  END IF;

  -- Return result with achievement information
  RETURN json_build_object(
    'is_correct', is_correct,
    'feedback', feedback,
    'quest_completed', quest_completed,
    'next_step', next_step,
    'total_steps', total_steps,
    'is_quest_achievement_unlocked', is_achievement_unlocked,
    'quest_id', step_record.quest_id,
    'quest_title', step_record.quest_title,
    'quest_difficulty', step_record.difficulty
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION submit_quest_step(UUID, UUID, TEXT) TO authenticated;