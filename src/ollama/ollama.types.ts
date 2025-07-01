import { ChatRequest } from 'ollama';

export interface PromptTemplate {
  system?: string;
  user: string;
  options?: ChatRequest['options'];
}

// TODO: Determine if this is needed
export interface PromptConfig {
  model: string;
  template: PromptTemplate;
}
