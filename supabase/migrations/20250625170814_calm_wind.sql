-- First drop the existing function
DROP FUNCTION IF EXISTS get_available_quests(uuid);

-- Then recreate the function with the correct return type
CREATE OR REPLACE FUNCTION get_available_quests(user_id_param uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  emoji text,
  reward_cred integer,
  unlocks_tool text,
  difficulty text,
  theme text,
  created_at timestamptz,
  is_active boolean,
  user_started boolean,
  user_completed boolean,
  current_step integer,
  total_steps bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use the provided user_id_param or fall back to auth.uid()
  IF user_id_param IS NULL THEN
    user_id_param := auth.uid();
  END IF;

  RETURN QUERY
  SELECT 
    q.id,
    q.title,
    q.description,
    q.emoji,
    q.reward_cred,
    q.unlocks_tool,
    q.difficulty,
    q.theme,
    q.created_at,
    q.is_active,
    COALESCE(uq.started_at IS NOT NULL, false) as user_started,
    COALESCE(uq.is_completed, false) as user_completed,
    COALESCE(uq.current_step, 1) as current_step,
    COALESCE(step_counts.total_steps, 0) as total_steps
  FROM quests q
  LEFT JOIN user_quests uq ON q.id = uq.quest_id AND uq.user_id = user_id_param
  LEFT JOIN (
    SELECT 
      qs.quest_id,
      COUNT(*) as total_steps
    FROM quest_steps qs
    GROUP BY qs.quest_id
  ) step_counts ON q.id = step_counts.quest_id
  WHERE q.is_active = true
  ORDER BY q.created_at DESC;
END;
$$;