import { Request, Response } from 'express';
import * as ollamaService from './ollama.service';

export const getCompromises = async (req: Request, res: Response) => {
  const { chat } = req.body;
  const start = Date.now();
  const result = await ollamaService.getCompromises(chat);

  res.json({ result, responseTimeMs: Date.now() - start });
};

export const getDisagreements = async (req: Request, res: Response) => {
  const { chat } = req.body;
  const start = Date.now();
  const result = await ollamaService.getDisagreements(chat);

  res.json({ result, responseTimeMs: Date.now() - start });
};

export const draftProposal = async (req: Request, res: Response) => {
  const { chat } = req.body;
  const start = Date.now();
  const proposal = await ollamaService.draftProposal(chat);

  res.json({ proposal, responseTimeMs: Date.now() - start });
};

export const isReadyForProposal = async (req: Request, res: Response) => {
  const { chat } = req.body;
  const start = Date.now();
  const result = await ollamaService.isReadyForProposal(chat);

  res.json({ result, responseTimeMs: Date.now() - start });
};

export const getChatSummary = async (req: Request, res: Response) => {
  const { chat } = req.body;
  const start = Date.now();
  const summary = await ollamaService.getChatSummary(chat);

  res.json({ summary, responseTimeMs: Date.now() - start });
};

export const getOllamaHealth = async (_: Request, res: Response) => {
  const payload = await ollamaService.getOllamaHealth();
  res.json({ message: payload });
};
