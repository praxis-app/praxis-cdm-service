/**
 * TODO: Convert routes to Matrix AS event handlers
 *
 * The following routes are currently used solely for testing purposes.
 * They will be converted to Matrix AS event handlers in the future.
 *
 * Ref: https://spec.matrix.org/v1.15/application-service-api/#application-services
 */

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
