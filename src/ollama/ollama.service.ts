import ollama from 'ollama';
import { MODELS } from './ollama.constants';
import { PromptTemplate } from './ollama.types';
import { INIT_OLLAMA_PROMPT } from './prompts/init-ollama.prompt';
import { OLLAMA_HEALTH_PROMPT } from './prompts/ollama-health.prompt';

export const getOllamaHealth = async () => {
  const content = await executePrompt('Llama 3.2 1B', OLLAMA_HEALTH_PROMPT);
  return content.trim();
};

export const getOllamaInitMessage = async () => {
  const start = Date.now();
  const modelName = 'Gemma 3 1B';
  const content = await executePrompt(modelName, INIT_OLLAMA_PROMPT);

  const end = Date.now();
  const duration = end - start;
  return `${modelName}: ${content.trim()} - ${duration}ms`;
};

export const executePrompt = async (
  model: keyof typeof MODELS,
  { system, user, options }: PromptTemplate,
  variables: Record<string, string> = {},
) => {
  await ensureModel(MODELS[model]);

  // Replace variables in user prompt
  const userContent = Object.entries(variables).reduce(
    (content, [key, value]) => content.replace(`{${key}}`, value),
    user,
  );

  const messages = [
    ...(system ? [{ role: 'system', content: system }] : []),
    { role: 'user', content: userContent },
  ];

  const { message } = await ollama.chat({
    model: MODELS[model],
    messages,
    options,
  });

  return message.content;
};

const ensureModel = async (modelName: string) => {
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
