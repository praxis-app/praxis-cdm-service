import express from 'express';
import {
  getOllamaHealth,
  isReadyForProposal,
  summarizeConversation,
} from './ollama.controller';

export const ollamaRouter = express.Router();

ollamaRouter.get('/health', getOllamaHealth);
ollamaRouter.post('/summarize', summarizeConversation);
ollamaRouter.post('/is-ready-for-proposal', isReadyForProposal);
