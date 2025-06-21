// Mock OpenAI integration for development
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