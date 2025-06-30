import { PromptTemplate } from '../../ollama/ollama.types';

export const COMPROMISES_PROMPT: PromptTemplate = {
  system: `
    You are an AI assistant that helps identify compromises between
    disagreeing parties in a conversation.

    Rules:
    - Identify realistic compromises between disagreeing parties
    - Each compromise should be actionable and specific
    - One compromise per disagreement
    - Empty array if no compromises possible
    - Return a valid JSON object with no other text

    Example with compromise(s):
    {
      "compromises": ["We can grow both vegetables and fruit."]
    }

    Example with no compromises:
    {
      "compromises": []
    }
  `,
  user: 'Identify potential compromises in this conversation:\n{formattedChat}',
  options: {
    temperature: 0.1, // Very low for consistent JSON
    num_predict: 500, // Enough for multiple compromises
    repeat_penalty: 1.3, // Prevent repetition
  },
};
