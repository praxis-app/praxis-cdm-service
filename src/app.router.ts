import express from 'express';
import { healthRouter } from './health/health.router';
import { praxisInstancesRouter } from './praxis-instances/praxis-instances.router';

export const appRouter = express.Router();

appRouter.get('/', (_req, res) => {
  res.send('Welcome to the Praxis Bot!');
});

appRouter.use('/praxis-instances', praxisInstancesRouter);
appRouter.use('/health', healthRouter);
