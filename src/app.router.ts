import express from 'express';
import { healthRouter } from './health/health.router';
import { ollamaRouter } from './ollama/ollama.router';

export const appRouter = express.Router();

appRouter.get('/', (_req, res) => {
  res.send('Welcome to the Praxis CDM Service!');
});

appRouter.use('/health', healthRouter);
appRouter.use('/ollama', ollamaRouter);
