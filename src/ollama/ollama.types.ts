import { ChatRequest } from 'ollama';
import { MODELS } from './ollama.constants';

export interface PromptTemplate {
  system?: string;
  user: string;
  options?: ChatRequest['options'];
}

export interface PromptConfig {
  model: keyof typeof MODELS;
  template: PromptTemplate;
}
