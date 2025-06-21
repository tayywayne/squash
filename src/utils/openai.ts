// OpenAI integration for conflict resolution
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

const makeOpenAIRequest = async (messages: any[]): Promise<string> => {
  // If no API key is available, throw an error to trigger fallback
  if (!OPENAI_API_KEY) {
    console.warn('No OpenAI API key available, using fallback');
    throw new Error('NO_API_KEY');
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API response:', response.status, errorText);
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      if (response.status === 401) {
        throw new Error('INVALID_API_KEY');
      }
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};

export const openAI = {
  translateMessage: async (rawMessage: string, mood: string): Promise<string> => {
    try {
      console.log('Attempting to translate message with OpenAI...');
      const messages = [
        {
          role: 'system',
          content: `You are a conflict resolution assistant. Your job is to translate raw, emotional messages into kinder, more constructive versions while preserving the core message and intent. The person writing this is feeling "${mood}".

Guidelines:
- Keep the core message and concerns intact
- Remove inflammatory language, personal attacks, or blame
- Use "I" statements instead of "you" accusations
- Focus on feelings and specific behaviors rather than character judgments
- Maintain the person's authentic voice but make it more constructive
- Keep it concise and clear
- Don't add new information or change the fundamental complaint

Return only the translated message, nothing else.`
        },
        {
          role: 'user',
          content: rawMessage
        }
      ];

      const result = await makeOpenAIRequest(messages);
      console.log('OpenAI translation successful');
      return result;
    } catch (error) {
      console.warn('OpenAI API failed, using enhanced fallback translation:', error);
      
      // Enhanced fallback: create a more thoughtful version manually
      let translatedMessage = rawMessage;
      
      // Replace harsh language with softer alternatives
      translatedMessage = translatedMessage
        .replace(/\b(stupid|dumb|idiot|moron)\b/gi, 'frustrating')
        .replace(/\b(hate|despise)\b/gi, 'really dislike')
        .replace(/\b(you always|you never)\b/gi, 'it seems like you often')
        .replace(/\b(you're wrong|you're stupid)\b/gi, 'I see this differently')
        .replace(/\b(shut up|whatever)\b/gi, 'I need some space to think')
        .replace(/\b(don't care|couldn't care less)\b/gi, 'find it hard to prioritize')
        .replace(/\b(your fault|you did this)\b/gi, 'this situation happened when')
        .replace(/\b(you make me|you caused)\b/gi, 'I felt')
        .replace(/\b(selfish|inconsiderate)\b/gi, 'focused on your own needs')
        .replace(/\b(lazy|useless)\b/gi, 'not as engaged as I hoped');
      
      // Add "I feel" statements where appropriate
      if (!translatedMessage.toLowerCase().includes('i feel') && !translatedMessage.toLowerCase().includes('i felt')) {
        if (mood === 'rage' || mood === 'annoyed') {
          translatedMessage = `I feel really frustrated about this situation. ${translatedMessage}`;
        } else if (mood === 'meh') {
          translatedMessage = `I feel confused about this situation. ${translatedMessage}`;
        }
      }
      
      // Ensure it's different from the original to show translation occurred
      if (translatedMessage === rawMessage) {
        translatedMessage = `I want to share how this situation affected me: ${rawMessage}`;
      }
      
      return translatedMessage.trim();
    }
  },

  generateResolution: async (user1Message: string, user2Message: string): Promise<{ summary: string; suggestion: string }> => {
    try {
      const messages = [
        {
          role: 'system',
          content: `You are an AI mediator helping resolve conflicts between two people. You have their translated, constructive statements. Your job is to:

1. Provide a fair summary of both perspectives
2. Offer a balanced resolution that helps both parties understand each other
3. Focus on mutual understanding, not assigning blame
4. Be empathetic but practical
5. Use a slightly sassy but caring tone (like a wise friend who tells it like it is)

Format your response as JSON with two fields:
- "summary": A fair summary of what you're hearing from both sides
- "suggestion": Practical next steps for resolution

Keep each field to 2-3 sentences maximum.`
        },
        {
          role: 'user',
          content: `Person 1's perspective: ${user1Message}

Person 2's perspective: ${user2Message}

Please provide a resolution.`
        }
      ];

      const response = await makeOpenAIRequest(messages);
      
      try {
        const parsed = JSON.parse(response);
        return {
          summary: parsed.summary || '',
          suggestion: parsed.suggestion || ''
        };
      } catch (error) {
        // Fallback if JSON parsing fails
        return {
          summary: "Both perspectives show valid concerns that deserve attention. There seems to be a communication gap that's causing frustration on both sides.",
          suggestion: "Try having a calm conversation where each person explains their feelings without interruption. Focus on understanding rather than being right."
        };
      }
    } catch (error) {
      console.warn('OpenAI API failed, using mock resolution');
      // Use the mock service as fallback
      const mockResult = await mockOpenAI.mediateConflict(user1Message, user2Message);
      return {
        summary: mockResult.summary,
        suggestion: mockResult.suggestion
      };
    }
  },

  rehashConflict: async (
    user1Message: string, 
    user2Message: string, 
    previousSummary: string, 
    previousSuggestion: string
  ): Promise<{ summary: string; suggestion: string }> => {
    try {
      console.log('Attempting to rehash conflict with OpenAI...');
      const messages = [
        {
          role: 'system',
          content: `You are an AI mediator helping to rehash a conflict that wasn't fully resolved. The parties have indicated they're not satisfied with the previous resolution attempt.

Your job is to:
1. Re-examine both perspectives with fresh eyes
2. Identify what might have been missed in the previous mediation
3. Offer a new approach or deeper insight that could help break the deadlock
4. Be more specific and actionable in your suggestions
5. Acknowledge that the previous attempt didn't fully work

Tone: Slightly more direct and practical than before, but still empathetic. Think "okay, let's try a different angle here."

Format your response as JSON with two fields:
- "summary": A fresh take on what's really going on, acknowledging the previous attempt
- "suggestion": More specific, actionable next steps that address why the first resolution didn't stick

Keep each field to 2-3 sentences maximum.`
        },
        {
          role: 'user',
          content: `Original perspectives:
Person 1: ${user1Message}
Person 2: ${user2Message}

Previous AI summary: ${previousSummary}
Previous AI suggestion: ${previousSuggestion}

The previous resolution didn't fully satisfy both parties. Please provide a fresh perspective and new approach.`
        }
      ];

      const response = await makeOpenAIRequest(messages);
      
      try {
        const parsed = JSON.parse(response);
        console.log('OpenAI rehash successful');
        return {
          summary: parsed.summary || '',
          suggestion: parsed.suggestion || ''
        };
      } catch (error) {
        console.warn('JSON parsing failed for rehash, using fallback');
        // Fallback if JSON parsing fails
        return {
          summary: "Looking at this again, it seems like the core issue might be deeper than initially thought. Sometimes conflicts persist because the underlying needs or expectations weren't fully addressed in the first round.",
          suggestion: "Try a more structured approach: each person should clearly state what they need (not just what they want the other person to stop doing), and then work together to find specific ways to meet those needs."
        };
      }
    } catch (error) {
      console.warn('OpenAI API failed for rehash, using enhanced fallback');
      
      // Enhanced fallback for rehash
      return {
        summary: "Since the first resolution attempt didn't fully work, let's dig deeper. Often when conflicts persist, it's because there are unspoken expectations or different communication styles at play that weren't addressed initially.",
        suggestion: "Take a step back and try this: each person should write down what they actually need to feel respected in this situation (not what the other person should do differently), then compare notes. Sometimes the real issue is different from what it appears to be on the surface."
      };
    }
  }
};

// Keep the mock for development/fallback
export const mockOpenAI = {
  mediateConflict: async (userMessage1: string, userMessage2: string) => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      summary: `Here's what I'm hearing: One of you feels like your boundaries weren't respected, while the other feels like they were just trying to help. Classic miscommunication vibes. Both perspectives are valid, but let's work on actually hearing each other instead of just waiting for your turn to be right.`,
      suggestion: `Try this: Take turns explaining how you felt without using "you always" or "you never." Start with "I felt..." instead. And maybe acknowledge that you both probably had good intentions, even if the execution was messier than a toddler's art project. Sometimes the goal isn't to win – it's to understand why you're both so worked up in the first place.`,
      tone: 'sassy-therapist'
    };
  },

  rehashConflict: async (user1Message: string, user2Message: string, previousSummary: string, previousSuggestion: string) => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      summary: "Okay, round two. The first attempt didn't stick, which usually means we're dealing with something deeper than surface-level disagreement. There might be different communication styles or unmet needs that weren't fully addressed.",
      suggestion: "Let's try a different approach: instead of focusing on who's right, each person should identify what they need to feel heard and respected. Then work backwards from there to find concrete actions that meet both sets of needs."
    };
  }
};