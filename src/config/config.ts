import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  matrix: {
    hsUrl: process.env.MATRIX_HS_URL || 'http://localhost:8008',
    botName: process.env.MATRIX_BOT_NAME || '@praxis-bot:localhost',
    hsToken: process.env.MATRIX_HS_TOKEN || '',
    asToken: process.env.MATRIX_AS_TOKEN || '',
  },
};
