/**
 * TODO: Convert routes to Matrix AS event handlers
 *
 * The following routes are currently used solely for testing purposes.
 * They will be converted to Matrix AS event handlers in the future.
 */

import { Request, Response } from 'express';
import * as chatAnalysisService from './chat-analysis.service';

export const getChatSummary = async (req: Request, res: Response) => {
  const { chat } = req.body;
  const start = Date.now();
  const summary = await chatAnalysisService.getChatSummary(chat);

  res.json({ summary, responseTimeMs: Date.now() - start });
};

export const isReadyForProposal = async (req: Request, res: Response) => {
  const { chat } = req.body;
  const start = Date.now();
  const result = await chatAnalysisService.isReadyForProposal(chat);

  res.json({ result, responseTimeMs: Date.now() - start });
};

export const getDisagreements = async (req: Request, res: Response) => {
  const { chat } = req.body;
  const start = Date.now();
  const result = await chatAnalysisService.getDisagreements(chat);

  res.json({ result, responseTimeMs: Date.now() - start });
};

export const getCompromises = async (req: Request, res: Response) => {
  const { chat } = req.body;
  const start = Date.now();
  const result = await chatAnalysisService.getCompromises(chat);

  res.json({ result, responseTimeMs: Date.now() - start });
};

export const draftProposal = async (req: Request, res: Response) => {
  const { chat } = req.body;
  const start = Date.now();
  const proposal = await chatAnalysisService.draftProposal(chat);

  res.json({ proposal, responseTimeMs: Date.now() - start });
};
