// Message analysis utilities for achievement detection

export interface MessageAnalysis {
  emojiCount: number;
  capsPercentage: number;
  questionMarkCount: number;
  exclamationCount: number;
  sorryCount: number;
  literallyCount: number;
  obviouslyCount: number;
  hasWhatever: boolean;
  fineCount: number;
  wordCount: number;
  characterCount: number;
}

export const analyzeMessage = (message: string): MessageAnalysis => {
  if (!message) {
    return {
      emojiCount: 0,
      capsPercentage: 0,
      questionMarkCount: 0,
      exclamationCount: 0,
      sorryCount: 0,
      literallyCount: 0,
      obviouslyCount: 0,
      hasWhatever: false,
      fineCount: 0,
      wordCount: 0,
      characterCount: 0
    };
  }

  const text = message.toLowerCase();
  const originalMessage = message;

  // Count emojis (basic emoji detection)
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  const emojiMatches = originalMessage.match(emojiRegex);
  const emojiCount = emojiMatches ? emojiMatches.length : 0;

  // Calculate caps percentage
  const letters = originalMessage.replace(/[^a-zA-Z]/g, '');
  const upperCaseLetters = originalMessage.replace(/[^A-Z]/g, '');
  const capsPercentage = letters.length > 0 ? (upperCaseLetters.length / letters.length) * 100 : 0;

  // Count punctuation
  const questionMarkCount = (originalMessage.match(/\?/g) || []).length;
  const exclamationCount = (originalMessage.match(/!/g) || []).length;

  // Count specific words/phrases
  const sorryCount = (text.match(/\bsorry\b/g) || []).length;
  const literallyCount = (text.match(/\bliterally\b/g) || []).length;
  const obviouslyCount = (text.match(/\bobviously\b/g) || []).length;
  const hasWhatever = /\bwhatever\b/.test(text);
  const fineCount = (text.match(/\bfine\b/g) || []).length;

  // Basic counts
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const characterCount = originalMessage.length;

  return {
    emojiCount,
    capsPercentage,
    questionMarkCount,
    exclamationCount,
    sorryCount,
    literallyCount,
    obviouslyCount,
    hasWhatever,
    fineCount,
    wordCount,
    characterCount
  };
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

export const isHoliday = (date: Date): boolean => {
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getDate();
  
  // Major US holidays
  const holidays = [
    { month: 1, day: 1 },   // New Year's Day
    { month: 2, day: 14 },  // Valentine's Day
    { month: 7, day: 4 },   // Independence Day
    { month: 10, day: 31 }, // Halloween
    { month: 11, day: 24 }, // Thanksgiving (approximate)
    { month: 11, day: 25 }, // Day after Thanksgiving
    { month: 12, day: 24 }, // Christmas Eve
    { month: 12, day: 25 }, // Christmas Day
    { month: 12, day: 31 }, // New Year's Eve
  ];
  
  return holidays.some(holiday => holiday.month === month && holiday.day === day);
};

export const getTimeCategory = (date: Date): {
  isEarlyMorning: boolean;
  isLateNight: boolean;
  isLunchTime: boolean;
  isMidnight: boolean;
} => {
  const hour = date.getHours();
  
  return {
    isEarlyMorning: hour >= 5 && hour < 7,
    isLateNight: hour >= 23 || hour < 5,
    isLunchTime: hour >= 11 && hour < 14,
    isMidnight: hour >= 23 || hour < 5
  };
};

export const getDayOfWeek = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

export const calculateResponseTime = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Hours
};