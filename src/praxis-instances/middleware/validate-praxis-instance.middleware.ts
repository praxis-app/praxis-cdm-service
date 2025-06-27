import { NextFunction, Request, Response } from 'express';
import { RegisterPraxisInstanceReq } from '../praxis-instances.types';

export const validatePraxisInstance = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { apiUrl, apiKey, serverConfigId } =
    req.body as RegisterPraxisInstanceReq;

  if (!apiUrl) {
    res.status(400).send('apiUrl is required');
    return;
  }
  if (!apiKey) {
    res.status(400).send('apiKey is required');
    return;
  }
  if (!serverConfigId) {
    res.status(400).send('serverConfigId is required');
    return;
  }

  if (
    typeof apiUrl !== 'string' ||
    typeof apiKey !== 'string' ||
    typeof serverConfigId !== 'string'
  ) {
    res
      .status(400)
      .send(
        'Invalid data types: apiUrl, apiKey, and serverConfigId must be strings',
      );
    return;
  }

  next();
};
