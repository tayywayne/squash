/*
  # Seed initial quests and steps

  This migration adds initial quest data to demonstrate the Conflict Confidence Quests feature.
  Each quest has multiple steps with different interaction types.
*/

-- Insert initial quests
INSERT INTO quests (id, title, description, emoji, reward_cred, difficulty, theme)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'How to Speak Up Without Imploding',
    'Learn to express your feelings assertively without apologizing for existing or exploding with anger.',
    '🗣️',
    25,
    'easy',
    'Assertiveness & calm expression'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Mastering the Group Chat',
    'Navigate the complex social dynamics of group messages without getting ghosted or causing drama.',
    '👥',
    30,
    'medium',
    'Healthy digital communication'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Emotional Boundaries 101',
    'Learn to set clear boundaries without guilt or defensiveness.',
    '🛡️',
    35,
    'medium',
    'Setting limits without guilt'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Conflict Detox',
    'Master the art of de-escalation and turn heated arguments into productive conversations.',
    '🧊',
    40,
    'hard',
    'De-escalation tactics'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'I-Statement Bootcamp',
    'Transform blame into ownership with powerful I-statements that express your feelings without attacking others.',
    '👁️',
    20,
    'easy',
    'Ownership of feelings'
  );

-- Insert steps for "How to Speak Up Without Imploding"
INSERT INTO quest_steps (quest_id, step_number, title, instruction, step_type, options, correct_answer, feedback_correct, feedback_incorrect)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    1,
    'Identify Apologetic Language',
    'Which of these statements contains unnecessary apologizing that undermines your message?',
    'quiz',
    '[
      {"id": "a", "text": "I need to discuss something important with you when you have time."},
      {"id": "b", "text": "I\'m sorry to bother you, but I was wondering if maybe we could talk about something if you\'re not too busy?"},
      {"id": "c", "text": "When you have a moment, I\'d like to talk about something that\'s been on my mind."},
      {"id": "d", "text": "I\'ve been thinking about something I\'d like to discuss with you."}
    ]',
    'b',
    'Exactly! Option B contains multiple unnecessary apologies and hesitations that undermine your message. Being direct doesn\'t mean being rude.',
    'Not quite. Look for language that unnecessarily apologizes for taking up space or expressing a need.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    2,
    'Rewrite Without Undermining',
    'Rewrite this message without undermining yourself: "I\'m really sorry to bring this up again, but I kind of feel like maybe you\'ve been ignoring my texts? Sorry if I\'m being too sensitive..."',
    'rewrite',
    NULL,
    NULL,
    'Great job! A strong rewrite removes unnecessary apologies while clearly stating your observation and feelings.',
    'Remember to remove unnecessary apologies and hedging language like "kind of" and "maybe" that undermine your message.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    3,
    'Choose the Assertive Response',
    'Your roommate keeps using your expensive shampoo without asking. Which response is assertive without being aggressive?',
    'choice',
    '[
      {"id": "a", "text": "I\'ve noticed my shampoo is being used. I\'d appreciate if you\'d ask before using my personal items."},
      {"id": "b", "text": "Stop using my stuff! That shampoo costs a fortune!"},
      {"id": "c", "text": "It\'s fine if you need to use my shampoo sometimes, no big deal..."},
      {"id": "d", "text": "Someone\'s been using my shampoo and I\'m not happy about it."}
    ]',
    'a',
    'Perfect! This response clearly states the observation and your boundary without attacking or being passive.',
    'That response is either too aggressive, too passive, or indirect. Look for a response that clearly states the issue and your boundary without attacking.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    4,
    'Identify Emotional Ownership',
    'Which statement takes ownership of feelings rather than blaming others?',
    'quiz',
    '[
      {"id": "a", "text": "You always make me feel ignored."},
      {"id": "b", "text": "You\'re so inconsiderate of my time."},
      {"id": "c", "text": "I feel frustrated when my messages go unanswered for days."},
      {"id": "d", "text": "Why do you have to be so flaky all the time?"}
    ]',
    'c',
    'Excellent! "I feel frustrated when..." owns your emotion and describes the situation without accusation.',
    'Look for a statement that uses "I feel" followed by an emotion, rather than statements that blame or label the other person.'
  );

-- Insert steps for "Mastering the Group Chat"
INSERT INTO quest_steps (quest_id, step_number, title, instruction, step_type, options, correct_answer, feedback_correct, feedback_incorrect)
VALUES
  (
    '22222222-2222-2222-2222-222222222222',
    1,
    'Identify the Group Chat Crime',
    'Which behavior is most likely to create tension in a group chat?',
    'quiz',
    '[
      {"id": "a", "text": "Sending a direct question to one specific person"},
      {"id": "b", "text": "Sharing a relevant article without commentary"},
      {"id": "c", "text": "Continuing to push a topic after others have tried to change the subject"},
      {"id": "d", "text": "Using emojis instead of words occasionally"}
    ]',
    'c',
    'Correct! Continuing to push a topic when others are clearly trying to move on can create tension and make people uncomfortable.',
    'That\'s not the most problematic behavior. Think about what might make others feel trapped or ignored in a conversation.'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    2,
    'Handling Being Ignored',
    'Your message in the group chat got completely ignored while the conversation continued. What\'s the healthiest response?',
    'choice',
    '[
      {"id": "a", "text": "Send the same message again but in ALL CAPS"},
      {"id": "b", "text": "Privately message someone asking why everyone ignored you"},
      {"id": "c", "text": "Post a passive-aggressive comment about being ignored"},
      {"id": "d", "text": "Let it go, or if it was important, reframe it relevantly when there\'s a natural opening"}
    ]',
    'd',
    'Exactly! Group chats are fluid and messages get missed. Reintroducing your point when relevant or letting it go shows emotional maturity.',
    'That approach might create more tension or awkwardness. Consider a response that maintains group harmony while still meeting your needs if necessary.'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    3,
    'Rewrite for Clarity',
    'Rewrite this confusing group chat message to be clearer: "hey so like about that thing from before with the stuff we talked about last week does anyone know if that\'s still happening or whatever?"',
    'rewrite',
    NULL,
    NULL,
    'Great rewrite! Clear, specific messages with context help everyone understand what you\'re referring to.',
    'Remember to be specific about which event you\'re referring to, include a clear question, and provide enough context for everyone to understand.'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    4,
    'Diffusing Tension',
    'Two friends are getting heated in the group chat about politics. What\'s the best way to help diffuse the situation?',
    'choice',
    '[
      {"id": "a", "text": "Jump in with your own political opinion to balance things out"},
      {"id": "b", "text": "Privately message both people telling them to stop"},
      {"id": "c", "text": "Post a funny meme or GIF to lighten the mood, then suggest continuing the conversation another time"},
      {"id": "d", "text": "Tell them both they\'re being dramatic and need to chill out"}
    ]',
    'c',
    'Perfect! Lightening the mood with humor and then gently suggesting a pause is a diplomatic way to diffuse tension without embarrassing anyone.',
    'That approach might escalate the situation or create more awkwardness. Look for a solution that acknowledges the tension but shifts the energy positively.'
  );

-- Insert steps for "Emotional Boundaries 101"
INSERT INTO quest_steps (quest_id, step_number, title, instruction, step_type, options, correct_answer, feedback_correct, feedback_incorrect)
VALUES
  (
    '33333333-3333-3333-3333-333333333333',
    1,
    'Identify the Boundary Violation',
    'Which scenario represents a clear boundary violation?',
    'quiz',
    '[
      {"id": "a", "text": "A friend asks if you\'re free this weekend"},
      {"id": "b", "text": "Your partner expresses disappointment when you cancel plans"},
      {"id": "c", "text": "A coworker asks about your weekend plans during lunch"},
      {"id": "d", "text": "Someone continues to discuss a topic after you\'ve said you\'re uncomfortable talking about it"}
    ]',
    'd',
    'Correct! Continuing a conversation after someone has expressed discomfort is a clear boundary violation. The other scenarios are normal social interactions.',
    'That scenario isn\'t necessarily a boundary violation. Look for a situation where someone\'s clearly expressed limit is being ignored.'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    2,
    'Setting a Clear Boundary',
    'Which statement sets a clear, healthy boundary?',
    'choice',
    '[
      {"id": "a", "text": "You\'re so needy! Stop texting me all the time!"},
      {"id": "b", "text": "I guess I can help you move again, even though I\'m really busy..."},
      {"id": "c", "text": "I need some alone time to recharge. I\'ll be available to talk tomorrow."},
      {"id": "d", "text": "Fine, do whatever you want. I don\'t care."}
    ]',
    'c',
    'Excellent! This statement clearly communicates your needs without blaming or shaming the other person, and offers an alternative.',
    'That response either attacks the other person, fails to actually set a boundary, or uses passive-aggressive language. A good boundary is clear, direct, and respectful.'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    3,
    'Rewrite as a Boundary Statement',
    'Rewrite this accusation as a boundary statement: "You always dump your problems on me and it\'s exhausting. You\'re so draining."',
    'rewrite',
    NULL,
    NULL,
    'Great job! A good boundary statement focuses on your needs and limits without attacking the other person\'s character.',
    'Remember to focus on "I" statements, your specific needs, and what you can offer instead of characterizing the other person negatively.'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    4,
    'Enforcing Boundaries',
    'Your friend keeps asking personal questions about your dating life at a group dinner despite your obvious discomfort. What\'s the most effective way to enforce your boundary?',
    'choice',
    '[
      {"id": "a", "text": "Laugh uncomfortably and change the subject"},
      {"id": "b", "text": "Say nothing but text them later about how upset you are"},
      {"id": "c", "text": "Say clearly: \"I\'m not comfortable discussing my dating life right now. Let\'s talk about something else.\""},
      {"id": "d", "text": "Tell them they\'re being inappropriate in front of everyone"}
    ]',
    'c',
    'Exactly right! This response clearly states your boundary in the moment, without attacking your friend or avoiding the issue.',
    'That approach either doesn\'t actually enforce the boundary, delays addressing the issue, or escalates the situation unnecessarily.'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    5,
    'Recognizing Guilt Trips',
    'Which response is a guilt trip attempting to violate your boundary?',
    'quiz',
    '[
      {"id": "a", "text": "I understand you need space. I\'ll check in tomorrow."},
      {"id": "b", "text": "No problem, we can reschedule for next week."},
      {"id": "c", "text": "I guess I\'ll just sit here alone then, since you clearly don\'t care about me..."},
      {"id": "d", "text": "Thanks for letting me know. Take care of yourself."}
    ]',
    'c',
    'Correct! This response uses emotional manipulation to make you feel guilty about your boundary. The other responses respect your limits.',
    'Look for language that attempts to make you feel guilty or responsible for the other person\'s emotions as a result of your boundary.'
  );

-- Insert steps for "Conflict Detox"
INSERT INTO quest_steps (quest_id, step_number, title, instruction, step_type, options, correct_answer, feedback_correct, feedback_incorrect)
VALUES
  (
    '44444444-4444-4444-4444-444444444444',
    1,
    'Identify Escalation Language',
    'Which phrase is most likely to escalate a conflict?',
    'quiz',
    '[
      {"id": "a", "text": "I see your perspective, but I have a different view."},
      {"id": "b", "text": "You ALWAYS do this! You NEVER listen!"},
      {"id": "c", "text": "I feel frustrated when this happens."},
      {"id": "d", "text": "Can we take a moment to cool down?"}
    ]',
    'b',
    'Correct! Absolute terms like "always" and "never," especially when capitalized for emphasis, tend to make people defensive and escalate conflicts.',
    'That phrase actually helps de-escalate rather than escalate. Look for language that includes absolutes, accusations, or character attacks.'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    2,
    'Choose the De-escalation Response',
    'Your partner says: "You\'re 20 minutes late AGAIN. You clearly don\'t respect my time!" Which response would best de-escalate this situation?',
    'choice',
    '[
      {"id": "a", "text": "Oh please, it\'s just 20 minutes. Stop being so dramatic."},
      {"id": "b", "text": "You\'re right, I\'m the worst. I\'m a terrible person."},
      {"id": "c", "text": "You\'re always attacking me! You\'re the one who was 30 minutes late last week!"},
      {"id": "d", "text": "You\'re right, I\'m late and that impacts you. I should have texted. I\'ll work on being more punctual."}
    ]',
    'd',
    'Excellent! This response acknowledges their feelings, takes responsibility, and commits to improvement without defensiveness.',
    'That response would likely escalate the situation through dismissal, sarcasm, self-deprecation, or counter-attacks. Look for a response that validates, takes appropriate responsibility, and looks forward.'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    3,
    'Rewrite to De-escalate',
    'Rewrite this escalating message to de-escalate the conflict: "You completely ruined the project with your last-minute changes. This is so typical of you not thinking things through!"',
    'rewrite',
    NULL,
    NULL,
    'Great de-escalation! Your rewrite focuses on the specific issue without attacking character, and opens the door to problem-solving.',
    'Remember to remove character attacks, focus on the specific issue rather than patterns, and use "I" statements about impact rather than "you" statements about intent.'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    4,
    'Identify the Pause Technique',
    'Which technique is most effective when you feel yourself getting too emotional during a conflict?',
    'quiz',
    '[
      {"id": "a", "text": "Immediately text or call all your friends to get their opinions"},
      {"id": "b", "text": "Say whatever you\'re feeling in the moment to be authentic"},
      {"id": "c", "text": "Tell the other person they\'re making you too emotional"},
      {"id": "d", "text": "Say \"I need a moment to collect my thoughts\" and take a short break"}
    ]',
    'd',
    'Exactly right! Taking a short, communicated pause gives you time to regulate your emotions without abandoning the conversation.',
    'That technique might actually intensify emotions or create more conflict. Look for an approach that allows for emotional regulation while maintaining respect.'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    5,
    'Choose the Bridge-Building Statement',
    'After a disagreement, which statement best builds a bridge toward resolution?',
    'choice',
    '[
      {"id": "a", "text": "Let\'s just forget this ever happened and move on."},
      {"id": "b", "text": "I see we have different perspectives. What matters most to you about this issue?"},
      {"id": "c", "text": "I\'ll forgive you this time, but don\'t let it happen again."},
      {"id": "d", "text": "Fine, you win. Let\'s do it your way."}
    ]',
    'b',
    'Perfect! This statement acknowledges the disagreement while showing curiosity about the other person\'s perspective, which opens the door to mutual understanding.',
    'That statement either bypasses the real issues, maintains a power dynamic, or contains passive-aggressive elements. Look for a response that acknowledges differences while seeking understanding.'
  );

-- Insert steps for "I-Statement Bootcamp"
INSERT INTO quest_steps (quest_id, step_number, title, instruction, step_type, options, correct_answer, feedback_correct, feedback_incorrect)
VALUES
  (
    '55555555-5555-5555-5555-555555555555',
    1,
    'Identify the I-Statement',
    'Which of these is a proper I-statement?',
    'quiz',
    '[
      {"id": "a", "text": "You make me so angry when you interrupt me."},
      {"id": "b", "text": "I feel like you\'re being rude."},
      {"id": "c", "text": "I feel frustrated when I\'m interrupted because I lose my train of thought."},
      {"id": "d", "text": "I think you should stop interrupting people."}
    ]',
    'c',
    'Correct! This is a complete I-statement with feeling, behavior, and impact. It avoids accusations while clearly communicating your experience.',
    'That\'s not a complete I-statement. A proper I-statement includes your feeling, the specific behavior, and the impact it has on you without accusation.'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    2,
    'Rewrite as an I-Statement',
    'Rewrite this accusation as an I-statement: "You never help with the dishes. You\'re so lazy."',
    'rewrite',
    NULL,
    NULL,
    'Excellent I-statement! You\'ve expressed your feeling, identified the specific behavior, and explained the impact without attacking character.',
    'Remember that an effective I-statement has three parts: how you feel, the specific behavior (not a character judgment), and the impact on you.'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    3,
    'Spot the Fake I-Statement',
    'Which of these is a "you-statement" disguised as an I-statement?',
    'quiz',
    '[
      {"id": "a", "text": "I feel hurt when plans are canceled last minute because I set aside time specifically for this."},
      {"id": "b", "text": "I feel like you don\'t care about my feelings."},
      {"id": "c", "text": "I get anxious when I don\'t receive a response for several hours."},
      {"id": "d", "text": "I appreciate when you let me know you\'ll be late."}
    ]',
    'b',
    'Correct! "I feel like you..." is actually a disguised accusation about the other person\'s intentions or character, not a true feeling statement.',
    'Look for statements that might begin with "I feel" but actually make claims about the other person\'s intentions, thoughts, or character.'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    4,
    'Complete the I-Statement',
    'Complete this I-statement: "I feel disappointed when _____ because _____."',
    'rewrite',
    NULL,
    NULL,
    'Great job completing the I-statement with a specific behavior and impact. This clearly communicates your experience without blame.',
    'Make sure you\'ve included a specific behavior (not a judgment) and the concrete impact it has on you to complete the I-statement formula.'
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS quests_is_active_idx ON quests(is_active);
CREATE INDEX IF NOT EXISTS quest_steps_quest_id_step_number_idx ON quest_steps(quest_id, step_number);
CREATE INDEX IF NOT EXISTS user_quests_user_id_quest_id_idx ON user_quests(user_id, quest_id);