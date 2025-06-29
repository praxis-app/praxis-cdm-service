import { Request, Response } from 'express';
import * as ollamaService from './ollama.service';

export const getCompromises = async (req: Request, res: Response) => {
  const { conversation } = req.body;

  const start = Date.now();
  const result = await ollamaService.getCompromises(conversation);

  res.json({ result, responseTimeMs: Date.now() - start });
};

export const getDisagreements = async (req: Request, res: Response) => {
  const { conversation } = req.body;

  const start = Date.now();
  const result = await ollamaService.getDisagreements(conversation);

  res.json({ result, responseTimeMs: Date.now() - start });
};

export const draftProposal = async (req: Request, res: Response) => {
  const { conversation } = req.body;

  const start = Date.now();
  const proposal = await ollamaService.draftProposal(conversation);

  res.json({ proposal, responseTimeMs: Date.now() - start });
};

export const isReadyForProposal = async (req: Request, res: Response) => {
  const { conversation } = req.body;

  const start = Date.now();
  const result = await ollamaService.isReadyForProposal(conversation);

  res.json({ result, responseTimeMs: Date.now() - start });
};

export const summarizeConversation = async (req: Request, res: Response) => {
  const { conversation } = req.body;

  const start = Date.now();
  const summary = await ollamaService.summarizeConversation(conversation);

  res.json({ summary, responseTimeMs: Date.now() - start });
};

export const getOllamaHealth = async (_: Request, res: Response) => {
  const payload = await ollamaService.getOllamaHealth();
  res.json({ message: payload });
};
