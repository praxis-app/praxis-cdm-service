import express from 'express';
import { handleTransaction } from './matrix.controller';

export const matrixRouter = express.Router();

matrixRouter.put('/_matrix/app/v1/transactions/:txnId', handleTransaction);
