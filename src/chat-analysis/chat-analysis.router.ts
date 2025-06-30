import express from 'express';
import {
  draftProposal,
  getChatSummary,
  getCompromises,
  getDisagreements,
  isReadyForProposal,
} from './chat-analysis.controller';

export const chatAnalysisRouter = express.Router();

chatAnalysisRouter.post('/summary', getChatSummary);
chatAnalysisRouter.post('/is-ready-for-proposal', isReadyForProposal);
chatAnalysisRouter.post('/disagreements', getDisagreements);
chatAnalysisRouter.post('/compromises', getCompromises);
chatAnalysisRouter.post('/draft-proposal', draftProposal);
