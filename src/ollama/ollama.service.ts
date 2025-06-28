import ollama from 'ollama';
import { ensureModel } from './ollama.utils';

const MODEL = 'llama3.2:3b';

interface Message {
  sender: string;
  body: string;
}

interface Conversation {
  messages: Message[];
}

export const summarizeConversation = async ({ messages }: Conversation) => {
  await ensureModel(MODEL);

  // Limit conversation length to avoid excessive processing
  const recentMessages = messages.slice(-50);

  const formattedMessages = recentMessages
    .map((message) => `${message.sender}: ${message.body}`)
    .join('\n');

  // Add metadata to the conversation
  const participantCount = new Set(recentMessages.map((m) => m.sender)).size;
  const messageCount = recentMessages.length;

  const formattedConversation = JSON.stringify({
    messages: formattedMessages,
    participantCount,
    messageCount,
  });

  const { message } = await ollama.chat({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `
          You are a conversation summarizer. Create a concise summary (2-3 sentences) covering:
          - Main topics discussed
          - Key decisions or conclusions
          - Action items (if any)
          - Unresolved issues
          - Important context
          Format: Direct summary without labels or prefixes.
        `,
      },
      {
        role: 'user',
        content: `
          Summarize this conversation:
          ${formattedConversation}
        `,
      },
    ],
    // Decision-making focused options
    options: {
      temperature: 0.2, // Lower creativity
      num_predict: 200, // Limit max tokens
      repeat_penalty: 1.2, // Prevent repetition
      top_k: 20, // Reduce nonsense
    },
  });

  return message.content.trim();
};

export const getOllamaHealth = async () => {
  await ensureModel(MODEL);

  const { message } = await ollama.chat({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `
          You are a service named "Ollama" that is running on a server.
          You are responsible for responding to health checks.
          Each response should be 7 words or less.
        `,
      },
      {
        role: 'user',
        content: `What is your current status?`,
      },
    ],
  });

  return message.content.trim();
};
