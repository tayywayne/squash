# Conflict Archetypes

Squashie assigns users dynamic conflict archetypes based on their behavior patterns in conflict resolution. These archetypes provide insight into a user's conflict style and change over time as behavior evolves.

## Archetype System

Each archetype includes:
- **Title**: Descriptive name
- **Emoji**: Visual representation
- **Description**: Explanation of the conflict style

Archetypes are assigned based on statistical analysis of:
- Total conflicts initiated vs. responded to
- Resolution rates
- Response times
- Use of rehash and core issue features
- Satisfaction voting patterns

## Archetype List

### Primary Archetypes

| Key | Title | Emoji | Description | Assignment Criteria |
|-----|-------|-------|-------------|---------------------|
| the-fixer | The Fixer | 🛠️ | Resolves conflicts as the responder with care and dedication | Resolves 3+ conflicts as the responder |
| the-rehasher | The Rehasher | ♻️ | Thoughtfully seeks better solutions when first attempts don't work | Votes "not satisfied" in 2+ conflicts |
| the-drama-generator | The Drama Generator | 🎭 | Frequently initiates conflicts - maybe needs some chill time | Starts 3+ conflicts in one month |
| the-swift-fixer | The Swift Fixer | ⚡ | Lightning-fast conflict resolution skills | Resolves 2+ conflicts in under 1 hour |
| the-passive-ghost | The Passive Ghost | 👻 | Starts conflicts but vanishes when it's time to engage | Starts a conflict and never replies |
| the-emotional-diplomat | The Emotional Diplomat | 🕊️ | Masters the art of balanced, thoughtful communication | Default for users with at least 1 conflict who don't fit other categories |
| the-chaos-goblin | The Chaos Goblin | 💣 | Leaves a trail of unresolved conflicts in their wake | Has 5+ unresolved or rehashed conflicts |

### Secondary Archetypes

| Key | Title | Emoji | Description | Assignment Criteria |
|-----|-------|-------|-------------|---------------------|
| the-cooldown-king | The Cooldown King/Queen | 🧊 | Takes their sweet time to respond - patience is a virtue | Consistently responds after long delays |
| the-unread-receipt | The Unread Receipt | 📪 | Receives conflicts but never responds - the ultimate ghost | Receives 2+ conflicts without responding |
| the-firestarter | The Firestarter | 🔥 | Messages tend to escalate situations rather than resolve them | Conflicts frequently reach final judgment |
| the-harmony-seeker | The Harmony Seeker | 🌈 | Consistently achieves mutual satisfaction in conflict resolution | 3+ mutually satisfied conflict outcomes |
| the-accountability-champ | The Accountability Champ | 📓 | Always follows through with the core issues clarification step | Completes core issue step in 3+ conflicts |
| the-polite-avenger | The Polite Avenger | 🧐 | Formal language with emotionally sharp undertones | Detected through message analysis |
| the-empath | The Empath | 🌊 | Frequently validates and acknowledges others' feelings | Detected through message analysis |
| the-disappearing-diplomat | The Disappearing Diplomat | 🕵️‍♂️ | Has a habit of abandoning conflicts mid-resolution | Abandons 2+ conflicts mid-resolution |
| the-spreadsheet-warrior | The Spreadsheet Warrior | 📊 | Conflicts often involve planning, schedules, and organizational tasks | Detected through message content analysis |
| the-side-eye-sender | The Side-Eye Sender | 👀 | Master of short, snarky one-line responses | Detected through message length and tone analysis |
| the-chronic-clarifier | The Chronic Clarifier | ❓ | Uses the core issues step multiple times - loves to dig deep | Uses core issues feature extensively |
| the-peaceful-observer | The Peaceful Observer | 🧘‍♀️ | Never starts or responds to conflicts - the zen master | No conflicts initiated or responded to |

## Assignment Logic

The archetype assignment function uses a priority-based system:

```typescript
determineArchetype: (stats: UserConflictStats): { key: string; archetype: Archetype } => {
  // Priority-based archetype assignment (higher priority rules first)
  
  // The Peaceful Observer - Never starts or responds to any conflicts
  if (stats.totalConflicts === 0) {
    return { key: 'the-peaceful-observer', archetype: ARCHETYPES['the-peaceful-observer'] };
  }

  // The Chaos Goblin - 5+ unresolved or rehashed conflicts
  if (stats.totalConflicts - stats.resolvedConflicts >= 5 || stats.rehashVotes >= 5) {
    return { key: 'the-chaos-goblin', archetype: ARCHETYPES['the-chaos-goblin'] };
  }

  // The Drama Generator - Starts 3+ conflicts in one month
  if (stats.conflictsStartedThisMonth >= 3) {
    return { key: 'the-drama-generator', archetype: ARCHETYPES['the-drama-generator'] };
  }

  // The Swift Fixer - Resolves 2+ conflicts in under 1 hour
  if (stats.fastResolutions >= 2) {
    return { key: 'the-swift-fixer', archetype: ARCHETYPES['the-swift-fixer'] };
  }

  // The Fixer - Resolves 3+ conflicts as the responder
  if (stats.resolvedAsResponder >= 3) {
    return { key: 'the-fixer', archetype: ARCHETYPES['the-fixer'] };
  }

  // The Harmony Seeker - 3+ mutually satisfied conflict outcomes
  if (stats.mutualSatisfactionCount >= 3) {
    return { key: 'the-harmony-seeker', archetype: ARCHETYPES['the-harmony-seeker'] };
  }

  // The Accountability Champ - Always completes the "core issue" step
  if (stats.coreIssueCompletions >= 3 && stats.totalConflicts > 0) {
    return { key: 'the-accountability-champ', archetype: ARCHETYPES['the-accountability-champ'] };
  }

  // The Rehasher - Votes "not resolved" in 2+ conflicts
  if (stats.rehashVotes >= 2) {
    return { key: 'the-rehasher', archetype: ARCHETYPES['the-rehasher'] };
  }

  // The Passive Ghost - Starts a conflict and never replies
  if (stats.ghostedConflicts >= 1) {
    return { key: 'the-passive-ghost', archetype: ARCHETYPES['the-passive-ghost'] };
  }

  // The Unread Receipt - Receives conflicts, never responds
  if (stats.receivedNeverResponded >= 2) {
    return { key: 'the-unread-receipt', archetype: ARCHETYPES['the-unread-receipt'] };
  }

  // Default archetype for users who don't fit other categories
  if (stats.totalConflicts >= 1) {
    return { key: 'the-emotional-diplomat', archetype: ARCHETYPES['the-emotional-diplomat'] };
  }

  // Fallback
  return { key: 'the-peaceful-observer', archetype: ARCHETYPES['the-peaceful-observer'] };
}
```

## Archetype Collection

Users can collect archetypes over time as their conflict resolution style evolves. Each new archetype unlocked is:

1. Added to their archetype collection
2. Displayed as an achievement notification
3. Viewable on their profile

The current active archetype is displayed next to the user's name throughout the application.

## Implementation Details

Archetypes are assigned through a scheduled process that:

1. Analyzes user conflict statistics
2. Determines the most appropriate archetype
3. Updates the user's profile if the archetype has changed
4. Unlocks an achievement for the new archetype
5. Notifies the user of their new archetype

The assignment logic is implemented in both database functions and Edge Functions to ensure consistent application.