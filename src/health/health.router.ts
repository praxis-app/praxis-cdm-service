import express from 'express';
import { authPraxisInstance } from '../praxis-instances/middleware/auth-praxis-instance.middleware';
import { getHealth } from './health.controller';

export const healthRouter = express.Router();

healthRouter.get('/', authPraxisInstance, getHealth);
