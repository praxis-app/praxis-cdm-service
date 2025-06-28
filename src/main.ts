import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import helmet, { contentSecurityPolicy } from 'helmet';
import morgan from 'morgan';
import { appRouter } from './app.router';
import { dataSource } from './database/data-source';
import { testOllama } from './ollama/ollama.utils';

dotenv.config();

(async () => {
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
    console.log(`Praxis CDM Service running at ${url} 🚀`);
  });

  await testOllama();
})();
