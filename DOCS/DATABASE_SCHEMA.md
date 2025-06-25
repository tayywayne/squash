# Database Schema

## Overview

Squashie uses a Supabase PostgreSQL database with a carefully designed schema to support conflict resolution, user profiles, achievements, and gamification features. The schema is designed with proper relationships, constraints, and Row Level Security (RLS) to ensure data integrity and security.

## Core Tables

### Users and Profiles

- **profiles**: Extends the Supabase auth.users table with additional user information
  - `id` (uuid, PK): References auth.users(id)
  - `username` (text, unique): User's chosen username
  - `first_name`, `last_name` (text): User's name
  - `avatar_url` (text): Profile picture URL
  - `conflict_archetype` (text): User's conflict resolution style
  - `archetype_emoji` (text): Emoji representing the archetype
  - `supporter_level` (text): Paid supporter tier
  - `supporter_emoji` (text): Emoji for supporter status
  - `onboarding_complete` (boolean): Whether user has completed onboarding

### Conflicts

- **conflicts**: Core table for conflict resolution
  - `id` (uuid, PK): Unique identifier
  - `title` (text): Conflict title
  - `user1_id` (uuid): Conflict creator (references auth.users)
  - `user2_email` (text): Email of invited user
  - `user2_id` (uuid, nullable): ID of responding user
  - `status` (enum): 'pending', 'active', 'resolved', 'abandoned', 'final_judgment'
  - `user1_mood` (text): Emotional state of user1
  - `user1_raw_message` (text): Original message from user1
  - `user1_translated_message` (text): AI-translated version
  - `user2_raw_message` (text): Original response from user2
  - `user2_translated_message` (text): AI-translated response
  - `ai_summary` (text): AI summary of the conflict
  - `ai_suggestion` (text): AI suggestion for resolution
  - `user1_satisfaction`, `user2_satisfaction` (boolean): Whether users are satisfied with resolution
  - `ai_rehash_summary`, `ai_rehash_suggestion` (text): Second attempt at resolution
  - `user1_core_issue`, `user2_core_issue` (text): Core issues identified by users
  - `ai_core_reflection`, `ai_core_suggestion` (text): AI reflection on core issues
  - `final_ai_ruling` (text): Final judgment when resolution fails
  - `ai_final_summary` (text): Short summary of final ruling

### Voting and Public Judgment

- **conflict_votes**: Votes on conflicts that reached final judgment
  - `id` (uuid, PK): Unique identifier
  - `conflict_id` (uuid): References conflicts(id)
  - `voter_id` (uuid): References auth.users(id)
  - `vote_type` (text): One of 'both_wrong', 'user1_wrong', 'user2_wrong', 'get_therapy', 'ai_right', 'reset_conflict'

### Reddit Conflicts

- **reddit_conflicts**: Daily conflicts imported from r/AmItheAsshole
  - `id` (uuid, PK): Unique identifier
  - `reddit_post_id` (text, unique): Reddit post ID
  - `title`, `author`, `original_text` (text): Post content
  - `ai_summary`, `ai_suggestion` (text): AI analysis
  - `is_active` (boolean): Whether this is the current daily conflict

- **reddit_conflict_votes**: Votes on Reddit conflicts
  - `id` (uuid, PK): Unique identifier
  - `reddit_conflict_id` (uuid): References reddit_conflicts(id)
  - `voter_id` (uuid): References auth.users(id)
  - `vote_type` (text): One of 'nta', 'yta', 'esh', 'nah'

### Achievements and Gamification

- **archetype_achievements**: Tracks unlocked conflict archetypes
  - `id` (uuid, PK): Unique identifier
  - `user_id` (uuid): References auth.users(id)
  - `archetype_name` (text): Archetype identifier
  - `emoji` (text): Visual representation
  - `unlocked_at` (timestamp): When achieved

- **user_achievements**: General achievements system
  - `id` (uuid, PK): Unique identifier
  - `user_id` (uuid): References auth.users(id)
  - `code` (text): Achievement identifier
  - `name`, `emoji`, `description` (text): Achievement details
  - `unlocked_at` (timestamp): When achieved

- **user_points**: SquashCred points system
  - `user_id` (uuid, PK): References auth.users(id)
  - `squashcred` (integer): Point balance
  - `updated_at` (timestamp): Last update time

- **squashcred_events**: Audit log for point transactions
  - `id` (uuid, PK): Unique identifier
  - `user_id` (uuid): References auth.users(id)
  - `amount` (integer): Points awarded/deducted
  - `reason` (text): Explanation for transaction
  - `created_at` (timestamp): When occurred

### Quests System

- **quests**: Educational conflict resolution quests
  - `id` (uuid, PK): Unique identifier
  - `title`, `description` (text): Quest details
  - `emoji` (text): Visual representation
  - `reward_cred` (integer): Points awarded on completion
  - `difficulty` (text): 'easy', 'medium', 'hard'
  - `theme` (text): Category/topic

- **quest_steps**: Individual steps within quests
  - `id` (uuid, PK): Unique identifier
  - `quest_id` (uuid): References quests(id)
  - `step_number` (integer): Order within quest
  - `title`, `instruction` (text): Step details
  - `step_type` (text): 'quiz', 'rewrite', 'choice'
  - `options` (jsonb): For quiz/choice types
  - `correct_answer` (text): Expected response
  - `feedback_correct`, `feedback_incorrect` (text): Response feedback

- **user_quests**: Tracks user progress on quests
  - `id` (uuid, PK): Unique identifier
  - `user_id` (uuid): References auth.users(id)
  - `quest_id` (uuid): References quests(id)
  - `current_step` (integer): Current progress
  - `is_completed` (boolean): Whether completed

- **user_quest_steps**: Tracks user progress on individual steps
  - `id` (uuid, PK): Unique identifier
  - `user_quest_id` (uuid): References user_quests(id)
  - `step_id` (uuid): References quest_steps(id)
  - `user_response` (text): User's answer
  - `is_correct` (boolean): Whether answer was correct

### Statistics and Tracking

- **global_stats**: Global conflict statistics
  - `id` (uuid, PK): Unique identifier
  - `total_conflicts` (bigint): Total conflicts created
  - `resolved_conflicts` (bigint): Successfully resolved conflicts
  - `last_updated` (timestamp): Last update time

- **profile_updates**: Tracks profile changes for achievements
  - `id` (uuid, PK): Unique identifier
  - `user_id` (uuid): References auth.users(id)
  - `update_type` (text): Type of update
  - `created_at` (timestamp): When occurred

- **leaderboard_views**: Tracks leaderboard views for achievements
  - `id` (uuid, PK): Unique identifier
  - `user_id` (uuid): References auth.users(id)
  - `created_at` (timestamp): When viewed

## Row Level Security (RLS)

All tables have Row Level Security enabled with carefully designed policies:

1. **Conflicts**:
   - Users can only read conflicts they're involved in
   - Only the creator can delete conflicts
   - Users can update conflicts they're involved in

2. **Profiles**:
   - Profiles are viewable by all authenticated users
   - Users can only update their own profile

3. **Votes**:
   - Anyone can read votes (for transparency)
   - Users cannot vote on their own conflicts
   - Users can only update their own votes

4. **Achievements**:
   - Anyone can read achievements (for social proof)
   - System functions handle achievement unlocking

5. **Quests**:
   - Anyone can read active quests
   - Users can only see their own progress

## Database Functions

The schema includes numerous PostgreSQL functions for:

- Unlocking achievements and archetypes
- Managing SquashCred points
- Tracking user statistics
- Generating leaderboards
- Managing quest progress

## Design Rationale

1. **Separation of Concerns**: Tables are designed around specific entities (conflicts, users, achievements) with clear relationships.

2. **Audit Trails**: Events like point transactions and profile updates are logged for transparency and achievement tracking.

3. **Security First**: RLS policies ensure users can only access appropriate data.

4. **Extensibility**: The schema allows for easy addition of new features (e.g., new achievement types, quest types).

5. **Performance**: Appropriate indexes are created on frequently queried columns.

6. **Data Integrity**: Foreign key constraints and check constraints ensure data validity.