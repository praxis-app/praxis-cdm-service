import axios from 'axios';
import crypto from 'crypto';
import { dataSource } from '../database/data-source';
import { PraxisInstance } from './models/praxis-instance.entity';
import { RegisterPraxisInstanceReq } from './praxis-instances.types';

const praxisInstanceRepository = dataSource.getRepository(PraxisInstance);

export const registerPraxisInstance = async ({
  apiUrl,
  apiKey,
  serverConfigId,
}: RegisterPraxisInstanceReq) => {
  const botApiKey = crypto.randomBytes(32).toString('hex');
  const savedConfig = await praxisInstanceRepository.save({
    apiUrl,
    apiKey,
    serverConfigId,
    botApiKey,
  });
  return savedConfig.botApiKey;
};

export const checkPraxisInstanceConnection = async (id: string) => {
  const praxisInstance = await praxisInstanceRepository.findOne({
    where: { id },
  });

  if (!praxisInstance) {
    throw new Error('Praxis instance not found');
  }

  const result = await axios.get(
    `${praxisInstance.apiUrl}/api/integrations/health`,
    {
      headers: {
        'x-api-key': praxisInstance.botApiKey,
        'Content-Type': 'application/json',
      },
    },
  );

  return result.data.status === 'healthy' && result.status === 200;
};

export const removePraxisInstance = async (id: string) => {
  await praxisInstanceRepository.delete(id);
};
