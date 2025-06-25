# SquashCred Points System

SquashCred is Squashie's virtual currency and reputation system. It rewards positive conflict resolution behaviors and penalizes negative ones, creating a gamified incentive structure.

## Point Values

### Earning Points

| Action | Points | Reason |
|--------|--------|--------|
| START_CONFLICT | +5 | Started a conflict |
| RESOLVE_CONFLICT | +20 | Resolved a conflict (both sides satisfied) |
| RESPOND_TO_CONFLICT | +10 | Responded to a conflict as user 2 |
| CORE_ISSUE_REFLECTION | +10 | Added thoughtful core issue reflection |
| REHASH_CONFLICT | +5 | Attempted to rehash a conflict |
| FIRST_CONFLICT | +15 | Sent your first conflict |
| QUICK_RESOLUTION | +25 | Resolved conflict in under 1 hour |
| PEACEFUL_RESOLUTION | +30 | Achieved mutual satisfaction |
| VOTE_ON_PUBLIC_CONFLICT | +2 | Voted on a public conflict |
| VOTE_ON_REDDIT_CONFLICT | +5 | Voted on daily Reddit conflict |
| HELPFUL_VOTE | +5 | Cast a constructive vote |
| DAILY_LOGIN | +3 | Logged in for the day |
| REFERRAL_BONUS | +25 | Referred a new user who signed up |
| HIGH_RESOLUTION_RATE | +50 | Maintained 90%+ resolution rate with 10+ conflicts |
| FIRST_PUBLIC_SHAME | +10 | First conflict reached the public shame board |
| SUPPORTER_BONUS | +100 | Became a Squashie supporter |
| FIRST_REDDIT_VOTE | +10 | Cast your first vote on a Reddit conflict |
| FIRST_ARCHETYPE_UNLOCK | +15 | Unlocked your first conflict archetype |
| FIRST_ACHIEVEMENT_UNLOCK | +15 | Unlocked your first achievement |
| FIRST_QUEST_STARTED | +10 | Started your first quest |
| QUEST_COMPLETED | +20 | Completed a quest |
| QUEST_PERFECT_SCORE | +30 | Completed a quest with perfect score |
| QUEST_HARD_COMPLETED | +40 | Completed a hard difficulty quest |
| WEEKEND_RESOLUTION | +15 | Resolved a conflict on the weekend |
| CONSECUTIVE_LOGINS | +20 | Logged in 7 days in a row |

### Losing Points

| Action | Points | Reason |
|--------|--------|--------|
| SPAM_OR_ABUSE | -20 | Flagged for spammy or abusive language |
| EXCESSIVE_REHASHING | -5 | Rehashed the same issue 3+ times |
| CONFLICT_EXPIRED | -2 | Let conflict expire with no resolution |
| GHOSTING | -10 | Started conflict but never responded |
| RECEIVED_NO_RESPONSE | -5 | Received conflict but never responded |
| ESCALATION | -15 | Escalated conflict instead of resolving |
| BAD_FAITH_VOTING | -10 | Voted in bad faith on public conflicts |
| ABANDONING_CONFLICT | -8 | Abandoned conflict mid-resolution |
| INVITE_IGNORED | -5 | Invited user never joined after a week |
| FINAL_JUDGMENT_ISSUED | -10 | Conflict reached final AI judgment |
| LOW_RESOLUTION_RATE | -25 | Resolution rate fell below 25% |
| REPORTED_BY_OTHER_USER | -15 | Reported by another user for bad behavior |
| MULTIPLE_ABANDONED_CONFLICTS | -20 | Abandoned 3+ conflicts in a month |
| EXCESSIVE_CAPS_USAGE | -5 | Excessive use of ALL CAPS in messages |
| INACTIVE_ACCOUNT | -10 | No activity for over 30 days |
| CONFLICT_SPAM | -30 | Created 5+ conflicts in a single day |

## Tier System

SquashCred points determine a user's tier, which is displayed on their profile and throughout the app.

| Points Range | Tier Emoji | Tier Title | Description |
|--------------|------------|------------|-------------|
| ≤ -51 | 🚨 | Walking Red Flag | Consistently problematic behavior |
| -50 to -1 | ⚠️ | Drama Magnet | Negative but not irredeemable |
| 0 | 🧊 | Emotionally Neutral | Starting point for new users |
| 1-99 | 🌱 | Conflict Newbie | Just beginning the journey |
| 100-499 | 💬 | Squash Apprentice | Learning the basics |
| 500-999 | 🛠️ | Conflict Fixer | Developing solid skills |
| 1,000-4,999 | 🎭 | Drama Diplomat | Experienced mediator |
| 5,000-9,999 | 🧘‍♀️ | Deescalation Expert | Advanced conflict resolver |
| 10,000-24,999 | ⚖️ | Chaos Whisperer | Master of difficult situations |
| 25,000-49,999 | 👑 | Peace Overlord | Elite conflict resolver |
| 50,000-99,999 | 🌈 | Enlightened Resolver | Near-legendary status |
| 100,000 | 🧠 | Legendary Squasher | Maximum achievement |

## Technical Implementation

The SquashCred system is implemented through several database tables and functions:

### Tables

- **user_points**: Stores current point balance
  - `user_id` (uuid, PK): References auth.users(id)
  - `squashcred` (int): Current point balance
  - `updated_at` (timestamp): Last update time

- **squashcred_events**: Audit log for point transactions
  - `id` (uuid, PK): Unique identifier
  - `user_id` (uuid): References auth.users(id)
  - `amount` (int): Points awarded/deducted
  - `reason` (text): Explanation for transaction
  - `created_at` (timestamp): When occurred

### Database Functions

```sql
-- Function to award or deduct SquashCred points
CREATE OR REPLACE FUNCTION public.award_squashcred(
  p_user_id uuid,
  p_amount int,
  p_reason text
)
RETURNS int AS $$
DECLARE
  current_points int;
  new_points int;
BEGIN
  -- Get current points or create record if doesn't exist
  INSERT INTO user_points (user_id, squashcred)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT squashcred INTO current_points
  FROM user_points
  WHERE user_id = p_user_id;
  
  -- Calculate new points with constraints
  new_points := current_points + p_amount;
  new_points := GREATEST(-100, LEAST(100000, new_points));
  
  -- Update points
  UPDATE user_points
  SET squashcred = new_points,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log the event (only if points actually changed)
  IF new_points != current_points THEN
    INSERT INTO squashcred_events (user_id, amount, reason)
    VALUES (p_user_id, new_points - current_points, p_reason);
  END IF;
  
  RETURN new_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Application Implementation

The system is used throughout the application to reward and penalize user actions:

```typescript
// Award SquashCred for action
export const awardForAction = async (
  userId: string, 
  actionKey: keyof typeof SQUASHCRED_ACTIONS
): Promise<{ newBalance: number; error?: string }> => {
  const action = SQUASHCRED_ACTIONS[actionKey];
  return squashCredService.awardPoints(userId, action.points, action.reason);
}
```

## Display Components

SquashCred is displayed in several UI components:

1. **SquashCredDisplay**: Shows current balance and tier
   - Appears in header, profile, and other locations
   - Color-coded based on point value
   - Includes tier emoji and tooltip

2. **SquashCredHistory**: Transaction history
   - Shows recent point changes with reasons
   - Displays timestamps and amounts
   - Color-coded for gains and losses

## Achievement Integration

The SquashCred system integrates with the achievement system:

- **SquashCred Millionaire**: Unlocked at 10,000+ points
- **Negative Nancy**: Unlocked at -50 points
- **Comeback Story**: Going from negative to positive points

## Constraints and Limits

- Minimum points: -100
- Maximum points: 100,000
- Points are always integers
- Transactions are atomic and logged