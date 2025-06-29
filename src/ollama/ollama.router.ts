import express from 'express';
import {
  draftProposal,
  getCompromises,
  getDisagreements,
  getOllamaHealth,
  isReadyForProposal,
  getChatSummary,
} from './ollama.controller';

export const ollamaRouter = express.Router();

ollamaRouter.get('/health', getOllamaHealth);
ollamaRouter.post('/summary', getChatSummary);
ollamaRouter.post('/is-ready-for-proposal', isReadyForProposal);
ollamaRouter.post('/draft-proposal', draftProposal);
ollamaRouter.post('/disagreements', getDisagreements);
ollamaRouter.post('/compromises', getCompromises);
