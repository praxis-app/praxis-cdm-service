import express from 'express';
import { matrixService } from './app-service';

// TODO: Remove this when no longer needed for testing
matrixService.on('event', (event) => {
  console.log('😎 matrix event', event);
});

export const matrixRouter = express.Router();

matrixRouter.put(
  '/_matrix/app/v1/transactions/:txnId',
  matrixService.handleTransaction,
);
