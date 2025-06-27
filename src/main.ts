import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import helmet, { contentSecurityPolicy } from 'helmet';
import morgan from 'morgan';
import ollama from 'ollama';
import { appRouter } from './app.router';
import { dataSource } from './database/data-source';

dotenv.config();

// TODO: Remove once no longer needed
const testOllama = async () => {
  // Test ollama
  // console.log('Pulling model...');
  // await ollama.pull({ model: 'llama3.1' });

  console.log('Sending prompt...');
  const response = await ollama.chat({
    model: 'llama3.1',
    messages: [{ role: 'user', content: 'Why is the sky blue?' }],
  });
  console.log(response.message.content);
};

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
