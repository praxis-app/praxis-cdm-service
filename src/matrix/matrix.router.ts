import express from 'express';
import { appService } from './app-service';

export const matrixRouter = express.Router();

matrixRouter
  .use(appService.authenticate)
  .put('/_matrix/app/v1/transactions/:txnId', appService.handleTransaction);
