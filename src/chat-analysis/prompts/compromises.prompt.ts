import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { PromptTemplate } from '../../ollama/ollama.types';

export const compromisesSchema = z.object({
  compromises: z.string().array().describe('An array of compromises'),
});

export const COMPROMISES_PROMPT: PromptTemplate = {
  system: `
    You are an AI assistant that helps identify compromises between
    disagreeing parties in a conversation.

    Rules:
    - Identify actionable compromises between disagreeing parties
    - Return a valid JSON object with no other text
    - Empty array if no compromises possible
    - One compromise per disagreement

    Example with compromise(s):
    {
      "compromises": ["We can grow both vegetables and fruit."]
    }

    Example with no compromises:
    {
      "compromises": []
    }
  `,
  user: 'Identify potential compromises in this conversation:\n{chatData}',
  options: {
    temperature: 0.1, // Very low for consistent JSON
    num_predict: 500, // Enough for multiple compromises
    repeat_penalty: 1.3, // Prevent repetition
  },
  format: zodToJsonSchema(compromisesSchema),
};
