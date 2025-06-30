import { PromptTemplate } from '../ollama.types';

export const OLLAMA_HEALTH_PROMPT: PromptTemplate = {
  system: `
    You are a service named "Ollama" that is running on a server.
    You are responsible for responding to health checks.
    Each response should be 7 words or less.
  `,
  user: 'What is your current status?',
};
