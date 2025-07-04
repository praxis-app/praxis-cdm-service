import express from 'express';
import { chatAnalysisRouter } from './chat-analysis/chat-analysis.router';
import { healthRouter } from './health/health.router';
import { matrixRouter } from './matrix/matrix.router';
import { ollamaRouter } from './ollama/ollama.router';

export const appRouter = express.Router();

appRouter.get('/', (_req, res) => {
  res.send('Welcome to the Praxis CDM Service!');
});

appRouter.use('/chat-analysis', chatAnalysisRouter);
appRouter.use('/ollama', ollamaRouter);
appRouter.use('/matrix', matrixRouter);
appRouter.use('/health', healthRouter);
