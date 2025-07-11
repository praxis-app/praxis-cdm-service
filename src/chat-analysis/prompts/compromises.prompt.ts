import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { PromptTemplate } from '../../ollama/ollama.types';

export const compromisesSchema = z.object({
  compromises: z.string().array().describe('An array of compromises'),
});

export const COMPROMISES_PROMPT: PromptTemplate = {
  system: `
    You are an AI assistant that helps identify potential compromises in a conversation.

    Rules:
    - Identify potential compromises in a conversation
    - Return an empty array if no compromises are possible in the conversation
    - Return an empty array if the conversation is not a disagreement
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
  user: 'Identify potential compromises in this conversation:\n{chatData}',
  options: {
    temperature: 0,
    num_predict: 500,
    repeat_penalty: 1.3,
  },
  format: zodToJsonSchema(compromisesSchema),
};
