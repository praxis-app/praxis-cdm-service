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
  const modelName = 'Gemma 3 1B';
  const model = MODELS[modelName];
  await ensureModel(model);

  const timeStart = Date.now();
  const { message } = await ollama.chat({
    model,
    messages: [
      {
        role: 'system',
        content: `
          You are an AI assistant that is running on a server.
          You are responsible for delcaring that you have been initialized.
          Include a robot-related emoji at the end of your response.
          Each response should be 8 words or less with no new lines.
        `,
      },
      {
        role: 'user',
        content: `What is your current status?`,
      },
    ],
  });

  const timeEnd = Date.now();
  const timeTaken = timeEnd - timeStart;
  console.info(`${modelName}: ${message.content.trim()} - ${timeTaken}ms`);
};
