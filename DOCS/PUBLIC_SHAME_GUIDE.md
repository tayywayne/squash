# Public Shame Guide

The Public Shame Board is where unresolved conflicts go to be judged by AI and voted on by the community. This feature adds accountability, entertainment, and social learning to the conflict resolution process.

## How Conflicts Reach Public Shame

A conflict reaches the Public Shame Board when:

1. Both users have attempted to resolve the conflict through normal mediation
2. The initial AI suggestion was rejected by at least one user
3. The rehashed AI suggestion was also rejected
4. The core issues exploration failed to reach mutual satisfaction
5. The "Get AI Final Ruling" option was selected

At this point, the conflict status changes from `active` to `final_judgment` and becomes publicly visible on the Public Shame Board.

## AI Final Ruling Process

### Prompt Structure

The AI final ruling uses a theatrical, Judge Judy-inspired prompt:

```javascript
const messages = [
  {
    role: 'system',
    content: `You are Judge AI, the final arbiter of unresolved conflicts. This conflict has been through multiple resolution attempts and both parties still can't agree. Your job is to deliver a dramatic, witty, and theatrical final ruling.

Style Guidelines:
- Channel Judge Judy meets internet meme culture
- Be theatrical and over-the-top but not mean-spirited
- Pick a side, both sides, or declare everyone wrong - your choice
- Use humor to deflate the situation
- Be decisive and final - no more suggestions for resolution
- Keep it under 250 words
- End with a dramatic "CASE CLOSED" or similar flourish

Tone: Sassy, dramatic, witty, but ultimately trying to help people laugh at themselves and move on.`
  },
  {
    role: 'user',
    content: `The following conflict has remained unresolved after multiple attempts at resolution.

Person 1's perspective: ${user1Message}
Person 2's perspective: ${user2Message}

Generate a dramatic and humorous final ruling.`
  }
]
```

### Summary Generation

A short summary is also generated for the public feed:

```javascript
const messages = [
  {
    role: 'system',
    content: `You are tasked with creating a very short, punchy summary of an AI's final ruling on a conflict. This summary will be displayed in a public feed.

Guidelines:
- Keep it under 100 characters
- Make it sassy and attention-grabbing
- Capture the essence of the ruling
- Use humor but don't be mean-spirited
- Think social media caption style

Return only the summary, nothing else.`
  },
  {
    role: 'user',
    content: `Create a short summary for this AI ruling: ${finalRuling}`
  }
]
```

## Community Voting

Once a conflict reaches the Public Shame Board, community members can vote on it. The voting options are:

| Vote Type | Emoji | Description | Meaning |
|-----------|-------|-------------|---------|
| both_wrong | 🙃 | Both of you are dumb | Neither party is in the right |
| user1_wrong | 🫵 | Person 1 is dumb | The conflict initiator is at fault |
| user2_wrong | 👈 | Person 2 is dumb | The responder is at fault |
| get_therapy | 🛋️ | Get therapy | The conflict requires professional help |
| ai_right | 📢 | The AI was right | The AI's earlier suggestions were correct |
| reset_conflict | 🔄 | Reboot the whole thing | The conflict needs a fresh start |

### Voting Rules

- Users cannot vote on their own conflicts
- Each user can only vote once per conflict
- Votes cannot be changed after submission
- Voting earns SquashCred points
- Certain vote types (like "get_therapy" and "ai_right") earn bonus points

## Public Display

The Public Shame Board displays:

1. **Conflict Title**: The original conflict title
2. **AI Final Summary**: Short summary of the ruling
3. **User Information**: Usernames and archetypes of both parties
4. **Vote Counts**: Current tally for each vote type
5. **Timestamp**: When the final ruling was issued

Users can click to expand and see:

1. **Full AI Ruling**: The complete theatrical judgment
2. **Voting Interface**: Options to cast their own vote

## Moderation Considerations

While the Public Shame Board is designed to be entertaining, several safeguards are in place:

1. **Anonymity Option**: Users can choose to appear anonymously
2. **Content Filtering**: AI rulings are filtered for inappropriate content
3. **Report System**: Users can report problematic rulings
4. **Limited Personal Details**: Specific identifying details are removed

## Technical Implementation

The Public Shame Board is implemented through:

### Database Structure

- **conflicts** table with `status = 'final_judgment'`
- **conflict_votes** table for vote tracking
- **ai_final_summary** and **final_ai_ruling** fields for content

### Database Functions

```sql
-- Function to get public AI rulings
CREATE OR REPLACE FUNCTION get_public_ai_rulings()
RETURNS TABLE (
  conflict_id uuid,
  title text,
  ai_final_summary text,
  final_ai_ruling text,
  final_ruling_issued_at timestamptz,
  user1_id uuid,
  user2_id uuid,
  user1_username text,
  user2_username text,
  user1_archetype_emoji text,
  user2_archetype_emoji text,
  user1_supporter_emoji text,
  user2_supporter_emoji text,
  vote_counts jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS conflict_id,
    c.title,
    c.ai_final_summary,
    c.final_ai_ruling,
    c.final_ruling_issued_at,
    c.user1_id,
    c.user2_id,
    p1.username AS user1_username,
    p2.username AS user2_username,
    p1.archetype_emoji AS user1_archetype_emoji,
    p2.archetype_emoji AS user2_archetype_emoji,
    p1.supporter_emoji AS user1_supporter_emoji,
    p2.supporter_emoji AS user2_supporter_emoji,
    COALESCE(
      jsonb_object_agg(
        cv.vote_type, 
        cv.vote_count
      ) FILTER (WHERE cv.vote_type IS NOT NULL),
      '{}'::jsonb
    ) AS vote_counts
  FROM conflicts c
  LEFT JOIN profiles p1 ON c.user1_id = p1.id
  LEFT JOIN profiles p2 ON c.user2_id = p2.id
  LEFT JOIN (
    SELECT 
      conflict_votes.conflict_id,
      conflict_votes.vote_type,
      COUNT(*) AS vote_count
    FROM conflict_votes
    GROUP BY conflict_votes.conflict_id, conflict_votes.vote_type
  ) cv ON c.id = cv.conflict_id
  WHERE c.status = 'final_judgment'
    AND c.final_ai_ruling IS NOT NULL
    AND c.ai_final_summary IS NOT NULL
  GROUP BY 
    c.id, 
    c.title, 
    c.ai_final_summary, 
    c.final_ai_ruling, 
    c.final_ruling_issued_at,
    c.user1_id,
    c.user2_id,
    p1.username,
    p2.username,
    p1.archetype_emoji,
    p2.archetype_emoji,
    p1.supporter_emoji,
    p2.supporter_emoji
  ORDER BY c.final_ruling_issued_at DESC;
END;
$$;
```

### Frontend Components

The `AIJudgmentFeedPage` component handles:
- Fetching public rulings
- Displaying rulings in a feed
- Handling vote submission
- Showing vote counts
- Expanding/collapsing detailed views

## Impact on SquashCred

The Public Shame Board affects SquashCred in several ways:

1. **Reaching Final Judgment**: Users lose points when their conflict reaches final judgment
2. **Voting**: Users earn points for voting on others' conflicts
3. **Constructive Votes**: Bonus points for votes like "ai_right" that acknowledge the AI's wisdom
4. **Achievement Unlocks**: Several achievements are tied to Public Shame Board activity

## Educational Value

Beyond entertainment, the Public Shame Board serves educational purposes:

1. **Learning from Others**: Users see how conflicts escalate and could have been resolved
2. **Pattern Recognition**: Community voting highlights common conflict patterns
3. **Humor as Defusion**: The theatrical AI judgments help defuse tension through humor
4. **Social Norms**: Establishes community standards for conflict resolution