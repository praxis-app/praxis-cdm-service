import { ChatRequest } from 'ollama';

/** Ollama models that are currently leveraged by the service. */
export type Model = 'llama3.1' | 'llama3.2:1b' | 'llama3.2:3b' | 'gemma3:1b';

export interface PromptTemplate {
  system?: string;
  user: string;
  options?: ChatRequest['options'];
}

export interface PromptConfig {
  model: Model;
  template: PromptTemplate;
  variables?: Record<string, string>;
}
