import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import helmet, { contentSecurityPolicy } from 'helmet';
import morgan from 'morgan';
import { appRouter } from './app.router';
import { dataSource } from './database/data-source';
import { getOllamaInitMessage } from './ollama/ollama.service';

dotenv.config();

(async () => {
  const startTime = Date.now();

  const app = express();
  const port = process.env.PORT;

  await dataSource.initialize();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: contentSecurityPolicy.getDefaultDirectives(),
      },
      crossOriginEmbedderPolicy: true,
    }),
  );

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(morgan('dev'));
  app.use(cors());

  app.use('/', appRouter);

  app.listen(port, () => {
    const url = `http://localhost:${port}`;
    const timeTaken = Date.now() - startTime;
    console.info(`Praxis CDM Service running at ${url} 🚀 - ${timeTaken}ms`);
  });

  const initMessage = await getOllamaInitMessage();
  console.info(initMessage);
})();
