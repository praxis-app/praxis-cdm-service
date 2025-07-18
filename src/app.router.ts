import express from 'express';
import { healthRouter } from './health/health.router';
import { matrixRouter } from './matrix/matrix.router';
import { ollamaRouter } from './chat-analysis/ollama/ollama.router';

export const appRouter = express.Router();

appRouter.get('/', (_req, res) => {
  res.send('Welcome to the Praxis CDM Service!');
});

appRouter.use('/ollama', ollamaRouter);
appRouter.use('/matrix', matrixRouter);
appRouter.use('/health', healthRouter);
