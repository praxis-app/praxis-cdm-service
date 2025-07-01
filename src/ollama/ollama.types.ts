import { ChatRequest } from 'ollama';
import { MODELS } from './ollama.constants';

export interface PromptTemplate {
  system?: string;
  user: string;
  options?: ChatRequest['options'];
}

export type Model = (typeof MODELS)[keyof typeof MODELS];

export interface PromptConfig {
  model: Model;
  template: PromptTemplate;
  variables?: Record<string, string>;
}
