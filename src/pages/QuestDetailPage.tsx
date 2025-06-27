import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Award, CheckCircle, X, Send, AlertTriangle, Sparkles, Info, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { questsService, QuestDetails, QuestStep, StepSubmissionResult } from '../utils/quests';
import Toast from '../components/Toast';

const QuestDetailPage: React.FC = () => {
  const { questId } = useParams<{ questId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questDetails, setQuestDetails] = useState<QuestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [userQuestId, setUserQuestId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stepResult, setStepResult] = useState<StepSubmissionResult | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showReading, setShowReading] = useState(true);

  // Load quest details
  useEffect(() => {
    const loadQuestDetails = async () => {
      if (!questId || questId === 'undefined') {
        setToast({ message: 'Invalid quest ID', type: 'error' });
        navigate('/quests');
        return;
      }
      
      try {
        setLoading(true);
        const details = await questsService.getQuestDetails(questId);
        setQuestDetails(details);
        
        // Set current step index based on user progress
        if (details.user_progress.is_started) {
          setCurrentStepIndex(details.user_progress.current_step - 1);
        }
        
        // Check if quest is already completed
        if (details.user_progress.is_completed) {
          setShowCompletionModal(true);
        }
      } catch (error) {
        console.error('Error loading quest details:', error);
        setToast({ message: 'Failed to load quest details', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadQuestDetails();
  }, [questId]);

  // Start quest if not already started
  useEffect(() => {
    const startQuestIfNeeded = async () => {
      if (!questId || !questDetails) return;
      
      // Skip if quest is already started
      if (questDetails.user_progress.is_started) {
        console.log('Quest already started, skipping startQuest call');
        return;
      }
      
      try {
        console.log('Starting quest:', questId);
        const userQuestId = await questsService.startQuest(questId);
        setUserQuestId(userQuestId);
        
        // Reload quest details to get updated progress
        const updatedDetails = await questsService.getQuestDetails(questId);
        setQuestDetails(updatedDetails);
      } catch (error) {
        console.error('Error starting quest:', error);
        
        setToast({ message: 'Failed to start quest', type: 'error' });
      }
    };

    startQuestIfNeeded();
  }, [questId, questDetails?.user_progress.is_started]);

  const handleSubmitStep = async () => {
    if (!questDetails || !questId) return;
    if (!user?.id) {
      setToast({ message: 'You must be logged in to submit answers', type: 'error' });
      return;
    }
    
    const currentStep = questDetails.steps[currentStepIndex];
    
    // Validate response
    if (currentStep.step_type === 'quiz' || currentStep.step_type === 'choice') {
      if (!selectedOption) {
        setToast({ message: 'Please select an option', type: 'error' });
        return;
      }
    } else if (currentStep.step_type === 'rewrite') {
      if (!userResponse.trim()) {
        setToast({ message: 'Please enter your response', type: 'error' });
        return;
      }
    }
    
    setSubmitting(true);
    
    try {
      // Get user quest ID if not already set
      let userQuestIdToUse = userQuestId;
      if (!userQuestIdToUse) {
        userQuestIdToUse = await questsService.startQuest(questId);
        setUserQuestId(userQuestIdToUse);
      }
      
      // Submit step
      const response = currentStep.step_type === 'rewrite' ? userResponse : selectedOption || '';
      const result = await questsService.submitQuestStep(
        user.id,
        userQuestIdToUse,
        currentStep.id,
        response
      );
      
      setStepResult(result);
      
      // Check if quest is completed
      if (result.quest_completed) {
        setShowCompletionModal(true);
      }
      
      // Reload quest details after a short delay
      setTimeout(async () => {
        const updatedDetails = await questsService.getQuestDetails(questId);
        setQuestDetails(updatedDetails);
        
        // Move to next step if not completed
        if (!result.quest_completed && result.next_step > currentStep.step_number) {
          setCurrentStepIndex(result.next_step - 1);
          setUserResponse('');
          setSelectedOption(null);
          setStepResult(null);
        }
      }, 2000);
    } catch (error) {
      console.error('Error submitting step:', error);
      setToast({ message: 'Failed to submit step', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    setStepResult(null);
  };

  // Get educational content based on quest ID and step number
  const getEducationalContent = (questId: string, stepNumber: number) => {
    // Content for "How to Speak Up Without Imploding"
    if (questId === '11111111-1111-1111-1111-111111111111') {
      if (stepNumber === 1) {
        return {
          title: "Drop the Sorry Spiral",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                Speaking up doesn't mean spiraling. Here's how to say what you mean without apologizing for your existence:
              </p>
              <div className="bg-lime-chartreuse p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-dark-teal mt-1 mr-2 flex-shrink-0" />
                  <p className="text-dark-teal font-bold">
                    <span className="font-black">Drop the Sorry Spiral:</span> "Sorry to bother you, but…" weakens your message. Unless you've spilled hot soup on their lap, you probably don't need to apologize.
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                When we over-apologize, we're essentially telling the other person (and ourselves) that our needs, thoughts, and feelings aren't as important. It's the communication equivalent of making yourself smaller.
              </p>
              <p className="text-dark-teal font-bold">
                Ready to spot unnecessary apologies? Let's see if you can identify them...
              </p>
            </>
          )
        };
      } else if (stepNumber === 2) {
        return {
          title: "Rewrite with Clarity",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                Hedging language like "kind of," "maybe," and "sorry if" undermines your message and makes it easy for others to dismiss your concerns.
              </p>
              <div className="bg-vivid-orange p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-white mt-1 mr-2 flex-shrink-0" />
                  <p className="text-white font-bold">
                    <span className="font-black">Rewrite with Clarity:</span> Be direct but kind. "I feel ignored" lands better than "maybe I'm being too sensitive..."
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                Strong communication doesn't mean being harsh—it means being clear. Remove the "maybes" and "kind ofs" when you're expressing a genuine concern or need.
              </p>
              <p className="text-dark-teal font-bold">
                Time to practice! Let's rewrite a message that's drowning in unnecessary apologies...
              </p>
            </>
          )
        };
      } else if (stepNumber === 3) {
        return {
          title: "Assertive > Aggressive",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                There's a world of difference between being assertive and being aggressive. One builds respect, the other builds resentment.
              </p>
              <div className="bg-green-teal p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-white mt-1 mr-2 flex-shrink-0" />
                  <p className="text-white font-bold">
                    <span className="font-black">Assertive &gt; Aggressive:</span> Assertiveness means owning your feelings and setting expectations without attacking. "Please don't use my shampoo without asking" is assertive. "Touch it again and I'll shave your head" is… something else.
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                Assertive communication is about standing up for yourself while still respecting others. It's firm but fair, clear but not cruel.
              </p>
              <p className="text-dark-teal font-bold">
                Let's see if you can identify the truly assertive response in this scenario...
              </p>
            </>
          )
        };
      } else if (stepNumber === 4) {
        return {
          title: "Own Your Emotions",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                No one "makes" you feel anything. Your emotions are valid, but they're yours to own.
              </p>
              <div className="bg-dark-teal p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-lime-chartreuse mt-1 mr-2 flex-shrink-0" />
                  <p className="text-lime-chartreuse font-bold">
                    <span className="font-black">Own Your Emotions:</span> Say "I feel frustrated when..." not "You're making me insane." You control your feelings — don't hand them over to someone else.
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                When you take ownership of your emotions, you reclaim your power in the conversation. It also makes the other person less defensive because you're not blaming them for how you feel.
              </p>
              <p className="text-dark-teal font-bold">
                Let's identify which statement truly takes ownership of feelings...
              </p>
            </>
          )
        };
      }
    }
    // Content for "Mastering the Group Chat"
    else if (questId === '22222222-2222-2222-2222-222222222222') {
      if (stepNumber === 1) {
        return {
          title: "Avoid the Group Chat Crimes",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                Welcome to the arena of unspoken rules and emoji landmines. Group chats thrive on clarity and respect.
              </p>
              <div className="bg-lime-chartreuse p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-dark-teal mt-1 mr-2 flex-shrink-0" />
                  <p className="text-dark-teal font-bold">
                    <span className="font-black">Avoid the Crimes:</span> Ghosting, drama-bombing, or side conversations in a main thread are the social equivalent of stepping on a Lego barefoot.
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                Group chats have their own social ecosystem. What might seem fine in a one-on-one conversation can create tension when seven people are watching it unfold.
              </p>
              <p className="text-dark-teal font-bold">
                Let's identify which behavior is most likely to create tension in a group chat...
              </p>
            </>
          )
        };
      } else if (stepNumber === 2) {
        return {
          title: "When You're Ignored",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                It happens to everyone: you drop what you think is a brilliant message into the group chat, and... crickets. The conversation just flows right past you.
              </p>
              <div className="bg-vivid-orange p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-white mt-1 mr-2 flex-shrink-0" />
                  <p className="text-white font-bold">
                    <span className="font-black">When You're Ignored:</span> It stings. But reacting with grace ("Hey just checking if anyone saw this 👀") is better than rage-leaving.
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                Remember that group chats move fast, and people might be reading while distracted. Your message probably wasn't intentionally ignored—it just got lost in the flow.
              </p>
              <p className="text-dark-teal font-bold">
                What's the healthiest way to handle being ignored? Let's find out...
              </p>
            </>
          )
        };
      } else if (stepNumber === 3) {
        return {
          title: "Rewrite for Clarity",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                Vague, rambling messages are the quickest way to get ignored in a group chat. No one wants to decode your stream of consciousness.
              </p>
              <div className="bg-green-teal p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-white mt-1 mr-2 flex-shrink-0" />
                  <p className="text-white font-bold">
                    <span className="font-black">Rewrite for Clarity:</span> Vague, rambling messages get ignored. Say what you mean in one clean sentence.
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                A good group chat message includes:
                <br />• Context (what are you referring to?)
                <br />• Clear question or statement
                <br />• Specific details when needed
              </p>
              <p className="text-dark-teal font-bold">
                Time to practice! Let's rewrite this confusing message...
              </p>
            </>
          )
        };
      } else if (stepNumber === 4) {
        return {
          title: "Diffuse, Don't Detonate",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                Every group chat eventually has that moment: two friends getting heated about politics, sports, or whether pineapple belongs on pizza (it does, fight me).
              </p>
              <div className="bg-dark-teal p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-lime-chartreuse mt-1 mr-2 flex-shrink-0" />
                  <p className="text-lime-chartreuse font-bold">
                    <span className="font-black">Diffuse, Don't Detonate:</span> If tensions rise, step in with empathy — not more gasoline. Acknowledge both sides, suggest a pause, or shift the tone.
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                Being the peacemaker doesn't mean shutting down important conversations. It means helping create space where those conversations can happen productively—which is rarely in a group chat.
              </p>
              <p className="text-dark-teal font-bold">
                Let's see which approach best diffuses tension without dismissing concerns...
              </p>
            </>
          )
        };
      }
    }
    // Content for "Emotional Boundaries 101"
    else if (questId === '33333333-3333-3333-3333-333333333333') {
      if (stepNumber === 1) {
        return {
          title: "Spot Boundary Violations",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                Boundaries aren't walls — they're doors with doorknobs you control. But first, you need to recognize when someone's trying to kick the door down.
              </p>
              <div className="bg-lime-chartreuse p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-dark-teal mt-1 mr-2 flex-shrink-0" />
                  <p className="text-dark-teal font-bold">
                    <span className="font-black">Spot Violations:</span> Repeatedly crossing lines after being told not to, oversharing, or guilt-tripping are boundary red flags.
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                Not every uncomfortable interaction is a boundary violation. The key is whether your expressed limits are being respected or ignored.
              </p>
              <p className="text-dark-teal font-bold">
                Let's identify which scenario represents a clear boundary violation...
              </p>
            </>
          )
        };
      } else if (stepNumber === 2) {
        return {
          title: "Set Boundaries Clearly",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                Setting boundaries isn't rude—it's responsible. Clear boundaries protect your energy and actually improve relationships.
              </p>
              <div className="bg-vivid-orange p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-white mt-1 mr-2 flex-shrink-0" />
                  <p className="text-white font-bold">
                    <span className="font-black">Set Boundaries Clearly:</span> "I'm not comfortable discussing that right now" is strong. "Haha maybe let's not?" is not.
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                A good boundary statement:
                <br />• Is clear and direct
                <br />• Focuses on your needs, not their character
                <br />• Offers an alternative when possible
              </p>
              <p className="text-dark-teal font-bold">
                Let's identify which statement sets a clear, healthy boundary...
              </p>
            </>
          )
        };
      } else if (stepNumber === 3) {
        return {
          title: "Turn Accusations Into Boundaries",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                Accusations create defensiveness. Boundaries create clarity. The difference is how you phrase it.
              </p>
              <div className="bg-green-teal p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-white mt-1 mr-2 flex-shrink-0" />
                  <p className="text-white font-bold">
                    <span className="font-black">Turn Accusations Into Boundaries:</span> Instead of "You're so draining," try "I need to take space when I feel emotionally overwhelmed."
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                Accusations focus on what's wrong with the other person. Boundaries focus on what you need to feel safe and respected. One leads to fights, the other leads to understanding.
              </p>
              <p className="text-dark-teal font-bold">
                Let's practice rewriting an accusation as a boundary statement...
              </p>
            </>
          )
        };
      } else if (stepNumber === 4) {
        return {
          title: "Enforce Calmly",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                Setting a boundary is step one. Enforcing it when it's crossed is step two—and often the harder part.
              </p>
              <div className="bg-dark-teal p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-lime-chartreuse mt-1 mr-2 flex-shrink-0" />
                  <p className="text-lime-chartreuse font-bold">
                    <span className="font-black">Enforce Calmly:</span> Repeating your boundary is okay. "Like I mentioned, I'm not discussing that tonight."
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                Enforcing boundaries in the moment takes courage, especially in group settings. But addressing it immediately is usually more effective than stewing about it later.
              </p>
              <p className="text-dark-teal font-bold">
                Let's see which approach most effectively enforces a boundary in this uncomfortable situation...
              </p>
            </>
          )
        };
      } else if (stepNumber === 5) {
        return {
          title: "Recognize Guilt Trips",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                Guilt trips are the passive-aggressive cousin of boundary violations. They're designed to make you feel bad for having boundaries at all.
              </p>
              <div className="bg-lime-chartreuse p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-dark-teal mt-1 mr-2 flex-shrink-0" />
                  <p className="text-dark-teal font-bold">
                    <span className="font-black">Watch for Guilt Trips:</span> "I guess I'll just sit here alone then, since you clearly don't care about me..." = manipulation in a cardigan.
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                When someone respects your boundary, they might be disappointed but they don't try to punish you for it. Guilt trips are a form of emotional manipulation.
              </p>
              <p className="text-dark-teal font-bold">
                Let's identify which response is attempting to guilt-trip you for setting a boundary...
              </p>
            </>
          )
        };
      }
    }
    // Content for "Conflict Detox"
    else if (questId === '44444444-4444-4444-4444-444444444444') {
      if (stepNumber === 1) {
        return {
          title: "Spot Escalation Language",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                You're not here to win. You're here to not make it worse. First step: recognize the language that turns disagreements into dumpster fires.
              </p>
              <div className="bg-lime-chartreuse p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-dark-teal mt-1 mr-2 flex-shrink-0" />
                  <p className="text-dark-teal font-bold">
                    <span className="font-black">Escalation Triggers:</span> Absolutes like "You always..." or "You never..." or using sarcasm during real tension — instant gasoline.
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                Words like "always," "never," and "clearly" are rarely accurate and almost always inflammatory. They make the other person focus on defending themselves rather than understanding you.
              </p>
              <p className="text-dark-teal font-bold">
                Let's identify which phrase is most likely to escalate a conflict...
              </p>
            </>
          )
        };
      } else if (stepNumber === 2) {
        return {
          title: "De-escalate Like a Pro",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                When someone comes at you hot, your instinct might be to match their energy. Resist! De-escalation is your superpower.
              </p>
              <div className="bg-vivid-orange p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-white mt-1 mr-2 flex-shrink-0" />
                  <p className="text-white font-bold">
                    <span className="font-black">De-escalate Like a Pro:</span> Try "I hear you, and I want to talk about it calmly," instead of defending or attacking.
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                De-escalation often means:
                <br />• Acknowledging their feelings
                <br />• Taking responsibility for your part
                <br />• Focusing on solutions, not blame
              </p>
              <p className="text-dark-teal font-bold">
                Let's see which response would best de-escalate this heated situation...
              </p>
            </>
          )
        };
      } else if (stepNumber === 3) {
        return {
          title: "Rewrite the Flames",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                Sometimes we draft messages when we're at peak frustration. Before hitting send, rewrite the flames into something constructive.
              </p>
              <div className="bg-green-teal p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-white mt-1 mr-2 flex-shrink-0" />
                  <p className="text-white font-bold">
                    <span className="font-black">Rewrite the Flames:</span> Instead of "You ruined everything," try "I was surprised by the last-minute changes — can we align better next time?"
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                A good de-escalating rewrite:
                <br />• Removes character attacks
                <br />• Focuses on specific behaviors, not patterns
                <br />• Includes a path forward
              </p>
              <p className="text-dark-teal font-bold">
                Let's practice rewriting this inflammatory message into something more constructive...
              </p>
            </>
          )
        };
      } else if (stepNumber === 4) {
        return {
          title: "Use the Pause",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                When emotions run high, your prefrontal cortex (the rational part of your brain) goes offline. The pause is your emergency reboot button.
              </p>
              <div className="bg-dark-teal p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-lime-chartreuse mt-1 mr-2 flex-shrink-0" />
                  <p className="text-lime-chartreuse font-bold">
                    <span className="font-black">Use the Pause:</span> Walk away, breathe, drink water, scream into a pillow (silently) — then return with a level head.
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                A good pause is:
                <br />• Communicated clearly ("I need a moment")
                <br />• Brief (minutes, not days)
                <br />• Followed by re-engagement
              </p>
              <p className="text-dark-teal font-bold">
                Let's identify which technique is most effective when emotions are running high...
              </p>
            </>
          )
        };
      } else if (stepNumber === 5) {
        return {
          title: "Build Bridges, Not Walls",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                After a conflict, someone needs to make the first move toward repair. Be that someone.
              </p>
              <div className="bg-lime-chartreuse p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-dark-teal mt-1 mr-2 flex-shrink-0" />
                  <p className="text-dark-teal font-bold">
                    <span className="font-black">Bridge Builders:</span> Say things like "I still care about our connection and want to fix this." It re-centers the relationship, not the fight.
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                Bridge-building statements:
                <br />• Acknowledge the disagreement
                <br />• Express care for the relationship
                <br />• Show curiosity about their perspective
              </p>
              <p className="text-dark-teal font-bold">
                Let's identify which statement best builds a bridge toward resolution...
              </p>
            </>
          )
        };
      }
    }
    // Content for "I-Statement Bootcamp"
    else if (questId === '55555555-5555-5555-5555-555555555555') {
      if (stepNumber === 1) {
        return {
          title: "Real I-Statements",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                I-statements are the secret weapon of emotionally evolved humans. They express your feelings without triggering defensiveness.
              </p>
              <div className="bg-lime-chartreuse p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-dark-teal mt-1 mr-2 flex-shrink-0" />
                  <p className="text-dark-teal font-bold">
                    <span className="font-black">Real I-Statements:</span> "I feel [emotion] when [situation], because [reason]." That's it. That's the tweet.
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                A proper I-statement:
                <br />• Names a genuine emotion (not a thought)
                <br />• Describes a specific situation
                <br />• Explains the impact on you
              </p>
              <p className="text-dark-teal font-bold">
                Let's identify which of these is a proper I-statement...
              </p>
            </>
          )
        };
      } else if (stepNumber === 2) {
        return {
          title: "Rewrite the Blame",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                Accusations create walls. I-statements create windows. Let's transform blame into something more productive.
              </p>
              <div className="bg-vivid-orange p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-white mt-1 mr-2 flex-shrink-0" />
                  <p className="text-white font-bold">
                    <span className="font-black">Rewrite the Blame:</span> "You never help!" becomes "I feel overwhelmed when I do all the dishes by myself."
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                When rewriting accusations:
                <br />• Remove "you" as the subject
                <br />• Focus on how you feel
                <br />• Describe the situation objectively
                <br />• Avoid character judgments
              </p>
              <p className="text-dark-teal font-bold">
                Time to practice! Let's rewrite this accusation as an I-statement...
              </p>
            </>
          )
        };
      } else if (stepNumber === 3) {
        return {
          title: "Beware Fake I-Statements",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                Not all statements that start with "I" are true I-statements. Some are just accusations wearing a disguise.
              </p>
              <div className="bg-green-teal p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-white mt-1 mr-2 flex-shrink-0" />
                  <p className="text-white font-bold">
                    <span className="font-black">Beware Fake I-Statements:</span> "I feel like you're an inconsiderate jerk" is not an I-statement — it's a glitter-coated accusation.
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                Red flags for fake I-statements:
                <br />• "I feel like you..." (that's a thought, not a feeling)
                <br />• "I feel that you..." (again, a thought)
                <br />• Any statement where "you" is the real subject
              </p>
              <p className="text-dark-teal font-bold">
                Let's spot which of these is actually a "you-statement" in disguise...
              </p>
            </>
          )
        };
      } else if (stepNumber === 4) {
        return {
          title: "Fill in the Gaps",
          content: (
            <>
              <p className="text-dark-teal font-bold mb-4">
                Now it's time to create your own I-statement from scratch. This is where the rubber meets the road!
              </p>
              <div className="bg-dark-teal p-4 border-2 border-black mb-4">
                <div className="flex items-start">
                  <Lightbulb className="h-5 w-5 text-lime-chartreuse mt-1 mr-2 flex-shrink-0" />
                  <p className="text-lime-chartreuse font-bold">
                    <span className="font-black">Fill in the Gaps:</span> Practice completing real I-statements like: "I feel disappointed when _____ because _____."
                  </p>
                </div>
              </div>
              <p className="text-dark-teal font-bold mb-4">
                A strong I-statement completion:
                <br />• Names a specific behavior (not a character trait)
                <br />• Explains the concrete impact on you
                <br />• Stays focused on your experience
              </p>
              <p className="text-dark-teal font-bold">
                Let's practice completing this I-statement with your own words...
              </p>
            </>
          )
        };
      }
    }
    
    // Default content if no specific content is found
    return {
      title: "Let's Learn Something New",
      content: (
        <p className="text-dark-teal font-bold">
          Ready to improve your conflict resolution skills? Let's dive into this step!
        </p>
      )
    };
  };

  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
    navigate('/quests');
  };

  const renderStepContent = (step: QuestStep) => {
    // If step result is available, show feedback
    if (stepResult) {
      return (
        <div className={`p-6 border-3 border-black ${stepResult.is_correct ? 'bg-green-teal' : 'bg-vivid-orange'}`}>
          <div className="flex items-center space-x-3 mb-4">
            {stepResult.is_correct ? (
              <>
                <CheckCircle className="h-6 w-6 text-white" />
                <h3 className="text-xl font-black text-white">CORRECT!</h3>
              </>
            ) : (
              <>
                <X className="h-6 w-6 text-white" />
                <h3 className="text-xl font-black text-white">NOT QUITE</h3>
              </>
            )}
          </div>
          <p className="text-white font-bold mb-6">
            {stepResult.is_correct ? step.feedback_correct : step.feedback_incorrect}
          </p>
          <button
            onClick={handleContinue}
            className="bg-white hover:bg-gray-100 text-dark-teal font-black py-2 px-4 border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1"
          >
            CONTINUE
          </button>
        </div>
      );
    }

    // Otherwise, show step content based on type
    switch (step.step_type) {
      case 'quiz':
      case 'choice':
        return (
          <div className="space-y-4">
            {step.options && step.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`w-full text-left p-4 border-3 transition-all ${
                  selectedOption === option.id
                    ? 'bg-lime-chartreuse border-black shadow-brutal'
                    : 'bg-white border-black hover:bg-lime-chartreuse/20'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 flex-shrink-0 border-2 border-black rounded-full mr-3 flex items-center justify-center">
                    {selectedOption === option.id && (
                      <div className="w-3 h-3 bg-dark-teal rounded-full"></div>
                    )}
                  </div>
                  <span className="font-bold text-dark-teal">{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        );
      
      case 'rewrite':
        return (
          <div className="space-y-4">
            <textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Type your response here..."
              className="w-full h-32 p-4 border-3 border-black font-bold text-dark-teal resize-none focus:outline-none focus:border-vivid-orange transition-colors"
            />
          </div>
        );
      
      default:
        return <p>Unknown step type</p>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-pulse-slow mb-4">
          <div className="text-6xl">📚</div>
        </div>
        <p className="text-dark-teal font-bold">Loading quest details...</p>
      </div>
    );
  }

  if (!questDetails) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">🤷</div>
        <h1 className="text-2xl font-black text-dark-teal mb-2">QUEST NOT FOUND</h1>
        <p className="text-dark-teal font-bold">This quest doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  const currentStep = questDetails.steps[currentStepIndex];
  const totalSteps = questDetails.steps.length;
  const progressPercentage = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  // Get educational content for current step
  const currentStepNumber = currentStepIndex + 1;
  const educationalContent = questDetails ? getEducationalContent(questDetails.quest.id, currentStepNumber) : null;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/quests')}
          className="flex items-center space-x-2 text-dark-teal hover:text-vivid-orange mb-6 transition-colors font-black"
        >
          <ArrowLeft size={20} />
          <span>BACK TO QUESTS</span>
        </button>
        
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="text-5xl">{questDetails.quest.emoji}</div>
            <div>
              <h1 className="text-3xl font-black text-dark-teal mb-2">{questDetails.quest.title}</h1>
              <p className="text-dark-teal font-bold">{questDetails.quest.description}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
                <span className={`px-3 py-1 text-xs font-black border-2 border-black ${
                  questDetails.quest.difficulty === 'easy' ? 'bg-green-teal text-white' :
                  questDetails.quest.difficulty === 'medium' ? 'bg-vivid-orange text-white' :
                  'bg-dark-teal text-white'
                }`}>
                  {questDetails.quest.difficulty.toUpperCase()}
                </span>
                <span className="px-3 py-1 text-xs font-black border-2 border-black bg-lime-chartreuse text-dark-teal">
                  {questDetails.quest.theme}
                </span>
                <span className="px-3 py-1 text-xs font-black border-2 border-black bg-dark-teal text-white">
                  +{questDetails.quest.reward_cred} CRED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-black text-dark-teal">STEP {currentStepIndex + 1} OF {totalSteps}</span>
          <span className="text-sm font-black text-dark-teal">{progressPercentage}% COMPLETE</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-black">
          <div 
            className="bg-lime-chartreuse h-full rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-white border-3 border-black shadow-brutal mb-6 overflow-hidden">
        <div className="p-6 border-b-3 border-black">
          <h2 className="text-xl font-black text-dark-teal mb-2">{currentStep.title}</h2>
          <p className="text-dark-teal font-bold">{currentStep.instruction}</p>
        </div>
        
        {/* Educational Content */}
        {educationalContent && (
          <div className="border-b-3 border-black">
            <div 
              className="p-4 bg-white flex items-center justify-between cursor-pointer"
              onClick={() => setShowReading(!showReading)}
            >
              <div className="flex items-center">
                <Info className="h-5 w-5 text-vivid-orange mr-2" />
                <h3 className="font-black text-dark-teal">{educationalContent.title}</h3>
              </div>
              {showReading ? (
                <ChevronUp className="h-5 w-5 text-dark-teal" />
              ) : (
                <ChevronDown className="h-5 w-5 text-dark-teal" />
              )}
            </div>
            
            {showReading && (
              <div className="p-6 bg-white/50">
                {educationalContent.content}
              </div>
            )}
          </div>
        )}
        
        <div className="p-6">
          {renderStepContent(currentStep)}
        </div>
        
        {/* Submit Button (only show if no result yet) */}
        {!stepResult && (
          <div className="p-6 border-t-3 border-black">
            <button
              onClick={handleSubmitStep}
              disabled={submitting || (!selectedOption && !userResponse.trim())}
              className="bg-vivid-orange hover:bg-orange-600 text-white px-6 py-3 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>SUBMITTING...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>SUBMIT ANSWER</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Quest Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-3 border-black shadow-brutal max-w-md w-full p-6 relative">
            <div className="absolute -top-4 -right-4 text-4xl animate-bounce">🎉</div>
            <div className="absolute -top-2 -left-2 text-3xl animate-bounce delay-100">✨</div>
            
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{questDetails.quest.emoji}</div>
              <h2 className="text-2xl font-black text-dark-teal mb-2">QUEST COMPLETED!</h2>
              <p className="text-dark-teal font-bold">
                You've successfully completed "{questDetails.quest.title}"
              </p>
            </div>
            
            <div className="bg-lime-chartreuse p-4 border-3 border-black mb-6">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Sparkles className="h-5 w-5 text-dark-teal" />
                <h3 className="text-lg font-black text-dark-teal">REWARDS EARNED</h3>
                <Sparkles className="h-5 w-5 text-dark-teal" />
              </div>
              <div className="space-y-2 text-center">
                <p className="flex items-center justify-center space-x-2 text-dark-teal font-bold">
                  <Award size={18} />
                  <span>+{questDetails.quest.reward_cred} SquashCred</span>
                </p>
                <p className="flex items-center justify-center space-x-2 text-dark-teal font-bold">
                  <CheckCircle size={18} />
                  <span>New achievement unlocked!</span>
                </p>
                {questDetails.quest.unlocks_tool && (
                  <p className="flex items-center justify-center space-x-2 text-dark-teal font-bold">
                    <AlertTriangle size={18} />
                    <span>New tool unlocked: {questDetails.quest.unlocks_tool}</span>
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={handleCloseCompletionModal}
              className="w-full bg-vivid-orange hover:bg-orange-600 text-white px-6 py-3 font-black border-3 border-black shadow-brutal hover:shadow-brutal-sm transition-all transform hover:translate-x-1 hover:translate-y-1"
            >
              CONTINUE YOUR JOURNEY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestDetailPage;