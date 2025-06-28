import { Request, Response } from 'express';
import * as ollamaService from './ollama.service';

export const summarizeConversation = async (req: Request, res: Response) => {
  const { conversation } = req.body;
  const summary = await ollamaService.summarizeConversation(conversation);
  res.json({ summary });
};

export const getOllamaHealth = async (_: Request, res: Response) => {
  const payload = await ollamaService.getOllamaHealth();
  res.json({ message: payload });
};
