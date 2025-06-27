import { Request, Response } from 'express';
import { PraxisInstance } from './models/praxis-instance.entity';
import * as praxisInstanceConfigsService from './praxis-instances.service';

export const registerPraxisInstance = async (req: Request, res: Response) => {
  const botApiKey = await praxisInstanceConfigsService.registerPraxisInstance(
    req.body,
  );
  res.json({ botApiKey });
};

export const checkPraxisInstanceConnection = async (
  _req: Request,
  res: Response,
) => {
  const isConnected =
    await praxisInstanceConfigsService.checkPraxisInstanceConnection(
      res.locals.praxisInstance.id,
    );
  res.json({ isConnected });
};

export const removePraxisInstance = async (_req: Request, res: Response) => {
  const praxisInstance = res.locals.praxisInstance as PraxisInstance;
  await praxisInstanceConfigsService.removePraxisInstance(praxisInstance.id);

  res.json({
    message: `Removed Praxis instance at ${praxisInstance.apiUrl}`,
  });
};
