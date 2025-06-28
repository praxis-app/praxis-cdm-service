import ollama from 'ollama';
import { ensureModel } from './ollama.utils';

export const getOllamaHealth = async () => {
  await ensureModel('llama3.1');

  const response = await ollama.chat({
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

  return response.message.content;
};
