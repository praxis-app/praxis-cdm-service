import ollama from 'ollama';
import { MODELS } from './ollama.constants';

export const ensureModel = async (modelName: string) => {
  try {
    const models = await ollama.list();
    const modelExists = models.models.some(
      (model) =>
        model.name === modelName || model.name.startsWith(modelName + ':'),
    );
    if (!modelExists) {
      await ollama.pull({ model: modelName });
    }
  } catch (error) {
    console.error('Error checking/pulling model:', error);
    throw error;
  }
};

export const initOllama = async () => {
  await ensureModel(MODELS['Gemma 3 1B']);

  const { message } = await ollama.chat({
    model: MODELS['Gemma 3 1B'],
    messages: [
      {
        role: 'system',
        content: `
          You are an AI assistant that is running on a server.
          You are responsible for delcaring that you have been initialized.
          Include a ghost-related emoji at the end of your response.
          Each response should be 10 words or less.
        `,
      },
      {
        role: 'user',
        content: `What is your current status?`,
      },
    ],
  });
  console.info(`Ollama: ${message.content.trim()}`);
};
