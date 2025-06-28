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
  await ensureModel('llama3.1');

  const { message } = await ollama.chat({
    model: 'llama3.1',
    messages: [
      {
        role: 'user',
        content: `
          Emit a 7 word response declaring that Ollama is ready to use.
          Include an emoji at the end that isn't a rocket but still makes sense.
          Do not include any other text or quotes.
        `,
      },
    ],
  });
  console.info(message.content);
};
