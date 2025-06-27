import express from 'express';
import { authPraxisInstance } from './middleware/auth-praxis-instance.middleware';
import { validatePraxisInstance } from './middleware/validate-praxis-instance.middleware';
import {
  checkPraxisInstanceConnection,
  registerPraxisInstance,
  removePraxisInstance,
} from './praxis-instances.controller';

export const praxisInstancesRouter = express.Router();

praxisInstancesRouter
  .post('/', validatePraxisInstance, registerPraxisInstance)
  .get('/check-connection', authPraxisInstance, checkPraxisInstanceConnection)
  .delete('/', authPraxisInstance, removePraxisInstance);
