import ollama from 'ollama';
import { ensureModel } from './ollama.utils';

interface Message {
  sender: string;
  body: string;
}

interface Conversation {
  messages: Message[];
}

export const summarizeConversation = async ({ messages }: Conversation) => {
  await ensureModel('llama3.1');

  const { message } = await ollama.chat({
    model: 'llama3.1',
    messages: [
      {
        role: 'system',
        content: `
          You are an AI assistant that specializes in conversation summarization.
          Your task is to create clear, concise, accurate summaries of conversations.
          Focus on key points, main topics, action items, and important decisions made.
        `,
      },
      {
        role: 'user',
        content: `Summarize the following conversation: ${messages
          .map((message) => `${message.sender}: ${message.body}`)
          .join('\n')}`,
      },
    ],
  });

  return message.content.trim();
};

export const getOllamaHealth = async () => {
  await ensureModel('llama3.1');

  const { message } = await ollama.chat({
    model: 'llama3.1',
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
