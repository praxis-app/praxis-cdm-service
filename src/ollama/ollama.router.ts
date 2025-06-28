import express from 'express';
import { getOllamaHealth, summarizeConversation } from './ollama.controller';

export const ollamaRouter = express.Router();

ollamaRouter.get('/health', getOllamaHealth);
ollamaRouter.post('/summarize', summarizeConversation);
