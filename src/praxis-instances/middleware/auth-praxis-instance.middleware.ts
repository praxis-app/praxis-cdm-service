import { NextFunction, Request, Response } from 'express';
import { dataSource } from '../../database/data-source';
import { PraxisInstance } from '../models/praxis-instance.entity';

const praxisInstanceRepository = dataSource.getRepository(PraxisInstance);

/**
 * Checks for a valid API key in request headers and authenticates the request,
 * adding the Praxis instance to the request object if successful.
 */
export const authPraxisInstance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.headers['x-api-key'] as string;
  if (!apiKey) {
    res.status(401).send('Unauthorized');
    return;
  }

  const praxisInstance = await praxisInstanceRepository.findOneBy({
    apiKey,
  });
  if (!praxisInstance) {
    res.status(401).send('Unauthorized');
    return;
  }

  res.locals.praxisInstance = praxisInstance;
  next();
};
