import ollama from 'ollama';

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
  await ensureModel('gemma3:1b');

  const { message } = await ollama.chat({
    model: 'gemma3:1b',
    messages: [
      {
        role: 'system',
        content: `
          You are a service named "Ollama" that is running on a server.
          You are responsible for delcaring that you have been initialized.
          Include an emoji at the end of each response that isn't a rocket, but still makes sense.
          Each response should be 7 words or less.
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
