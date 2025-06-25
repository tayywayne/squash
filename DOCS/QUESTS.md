# Conflict Confidence Quests

Squashie's Quests system provides interactive educational content to help users improve their conflict resolution skills. Each quest focuses on a specific communication skill or conflict resolution technique.

## Quest System Overview

Quests are structured as a series of interactive steps that teach and test conflict resolution skills. Each quest includes:

- **Title**: Descriptive name
- **Description**: Overview of what will be learned
- **Emoji**: Visual representation
- **Reward**: SquashCred points awarded upon completion
- **Difficulty**: Easy, medium, or hard
- **Theme**: Category/topic focus
- **Steps**: Series of interactive challenges

## Quest Types

Squashie currently offers five quests:

### 1. How to Speak Up Without Imploding 🗣️

**Difficulty**: Easy  
**Theme**: Assertiveness & calm expression  
**Reward**: 25 SquashCred

This quest teaches users to express their feelings assertively without apologizing excessively or exploding with anger. Steps include:

1. **Identify Apologetic Language**: Quiz to recognize unnecessary apologizing
2. **Rewrite Without Undermining**: Exercise to remove self-undermining language
3. **Choose the Assertive Response**: Multiple-choice scenario about setting boundaries
4. **Identify Emotional Ownership**: Quiz on taking ownership of feelings

### 2. Mastering the Group Chat 👥

**Difficulty**: Medium  
**Theme**: Healthy digital communication  
**Reward**: 30 SquashCred

This quest helps users navigate the complex social dynamics of group messages. Steps include:

1. **Identify the Group Chat Crime**: Quiz on behaviors that create tension
2. **Handling Being Ignored**: Multiple-choice scenario about being overlooked
3. **Rewrite for Clarity**: Exercise to improve a confusing message
4. **Diffusing Tension**: Multiple-choice scenario about de-escalating heated discussions

### 3. Emotional Boundaries 101 🛡️

**Difficulty**: Medium  
**Theme**: Setting limits without guilt  
**Reward**: 35 SquashCred

This quest teaches users to set clear boundaries without guilt or defensiveness. Steps include:

1. **Identify the Boundary Violation**: Quiz to recognize boundary violations
2. **Setting a Clear Boundary**: Multiple-choice scenario about boundary setting
3. **Rewrite as a Boundary Statement**: Exercise to transform accusations
4. **Enforcing Boundaries**: Multiple-choice scenario about maintaining boundaries
5. **Recognizing Guilt Trips**: Quiz to identify emotional manipulation

### 4. Conflict Detox 🧊

**Difficulty**: Hard  
**Theme**: De-escalation tactics  
**Reward**: 40 SquashCred

This quest teaches users to de-escalate heated arguments. Steps include:

1. **Identify Escalation Language**: Quiz on phrases that worsen conflicts
2. **Choose the De-escalation Response**: Multiple-choice scenario about calming situations
3. **Rewrite to De-escalate**: Exercise to transform inflammatory messages
4. **Identify the Pause Technique**: Quiz on emotional regulation strategies
5. **Choose the Bridge-Building Statement**: Multiple-choice scenario about reconciliation

### 5. I-Statement Bootcamp 👁️

**Difficulty**: Easy  
**Theme**: Ownership of feelings  
**Reward**: 20 SquashCred

This quest helps users transform blame into ownership with I-statements. Steps include:

1. **Identify the I-Statement**: Quiz to recognize proper I-statements
2. **Rewrite as an I-Statement**: Exercise to transform accusatory language
3. **Spot the Fake I-Statement**: Quiz to identify disguised accusations
4. **Complete the I-Statement**: Exercise to practice the I-statement formula

## Step Types

Quests include three types of interactive steps:

1. **Quiz**: Multiple-choice questions with a single correct answer
2. **Choice**: Scenario-based decision making with a best option
3. **Rewrite**: Text input exercises to practice reformulating messages

## Technical Implementation

### Database Structure

Quests are stored in four main tables:

- **quests**: Main quest definitions
- **quest_steps**: Individual steps within quests
- **user_quests**: Tracks user progress on quests
- **user_quest_steps**: Tracks user progress on individual steps

### Database Functions

```sql
-- Function to get available quests with user progress
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
```

### Frontend Implementation

The quest system is implemented through several components:

1. **QuestsPage**: Lists all available quests with progress
2. **QuestDetailPage**: Displays individual quest steps
3. **QuestStep**: Renders different step types (quiz, choice, rewrite)
4. **QuestCompletion**: Modal shown upon quest completion

## User Flow

1. User browses available quests on the Quests page
2. User selects a quest to start or continue
3. User progresses through steps one by one
4. Each step provides immediate feedback
5. Upon completion, user receives SquashCred reward and achievement

## Rewards and Progression

Quests provide several benefits:

1. **SquashCred**: Points awarded upon completion (20-40 based on difficulty)
2. **Achievements**: Unlocked for quest-related milestones
3. **Skill Development**: Practical conflict resolution techniques
4. **Progression Tracking**: Visual progress indicators

## Future Expansion

The quest system is designed for easy expansion:

1. **New Quest Types**: Additional communication skills and scenarios
2. **Interactive Elements**: More engaging step types (e.g., drag-and-drop, video)
3. **Difficulty Progression**: Sequential quest paths with prerequisites
4. **Specialized Tracks**: Focused learning paths for specific relationship types