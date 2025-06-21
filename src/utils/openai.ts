// OpenAI integration for conflict resolution
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
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
    throw new Error('No OpenAI API key available');
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
      console.warn('OpenAI rate limit exceeded, using fallback');
    } else {
      console.error('OpenAI API error:', error);
    }
    throw error;
  }
};

export const openAI = {
  translateMessage: async (rawMessage: string, mood: string): Promise<string> => {
    try {
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

      return await makeOpenAIRequest(messages);
    } catch (error) {
      console.warn('OpenAI API failed, using fallback translation');
      // Fallback: return a cleaned up version of the message
      return rawMessage.replace(/\b(stupid|dumb|idiot|hate)\b/gi, '[frustrated]')
                      .replace(/you always|you never/gi, 'sometimes')
                      .trim();
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
  }
};