import { ChatRequest } from 'ollama';
import { MODELS } from './ollama.constants';

export interface PromptTemplate {
  system?: string;
  user: string;
  options?: ChatRequest['options'];
}

// TODO: Determine if this is needed
export interface PromptConfig {
  model: keyof typeof MODELS;
  template: PromptTemplate;
}
