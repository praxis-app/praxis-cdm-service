import ollama from 'ollama';
import { MODELS } from './ollama.constants';
import { PromptTemplate } from './ollama.types';
import { INIT_OLLAMA_PROMPT } from './prompts/init-ollama.prompt';
import { OLLAMA_HEALTH_PROMPT } from './prompts/ollama-health.prompt';

/**
 * In-memory cache of verified Ollama models.
 *
 * This cache prevents redundant model verification checks by storing
 * model names that have already been confirmed to exist locally.
 * Without this cache, we would need to call `ollama.list()` on every
 * request to verify model availability.
 */
const verifiedModels = new Set<string>();

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

const ensureModel = async (model: string) => {
  // If the model is already verified, bail
  if (verifiedModels.has(model)) {
    return;
  }
  try {
    const models = await ollama.list();
    const modelExists = models.models.some(
      (m) => m.name === model || m.name.startsWith(model + ':'),
    );
    if (!modelExists) {
      const start = Date.now();
      console.info(`Pulling model: ${model}`);
      await ollama.pull({ model: model });

      const duration = Date.now() - start;
      console.info(`Model pulled in ${duration}ms: ${model}`);
    }
    // Always add the model if not already verified
    verifiedModels.add(model);
  } catch (error) {
    console.error('Error checking/pulling model:', error);
    throw error;
  }
};
