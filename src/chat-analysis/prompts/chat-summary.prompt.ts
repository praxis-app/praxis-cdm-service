// TODO: Determine whether to rename `formattedChat` to `chat`

import { PromptTemplate } from '../../ollama/ollama.types';

export const CHAT_SUMMARY_PROMPT: PromptTemplate = {
  system: `
    You are a conversation summarizer. Create a concise summary (2-3 sentences) covering:
    - Main topics discussed
    - Key decisions or conclusions
    - Action items (if any)
    - Unresolved issues
    - Important context
    Format: Direct summary without labels or prefixes.
  `,
  user: 'Summarize this conversation:\n{formattedChat}',
  // Decision-making focused options
  options: {
    temperature: 0.2, // Lower creativity
    num_predict: 200, // Limit max tokens
    repeat_penalty: 1.2, // Prevent repetition
    top_k: 20, // Reduce nonsense
  },
};
