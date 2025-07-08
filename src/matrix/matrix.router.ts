import express from 'express';
import { appService } from './app-service';

export const matrixRouter = express.Router();

matrixRouter.put(
  '/_matrix/app/v1/transactions/:txnId',
  appService.handleTransaction,
);
