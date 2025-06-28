import ollama from 'ollama';
import { ensureModel } from './ollama.utils';

export const getOllamaHealth = async () => {
  await ensureModel('llama3.1');

  const response = await ollama.chat({
    model: 'llama3.1',
    messages: [
      {
        role: 'user',
        content: `
          You are a service named "Ollama" that is running on a server.
          You are responsible for responding to health checks.
          Respond with a 7 word message.
        `,
      },
    ],
  });

  return response.message.content;
};
