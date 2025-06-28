import { Request, Response } from 'express';
import { testOllama } from './ollama.utils';

export const getOllamaHealth = async (_: Request, res: Response) => {
  const payload = await testOllama();
  res.json({ message: payload });
};
