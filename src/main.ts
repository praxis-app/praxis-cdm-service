import bodyParser from 'body-parser';
import cors from 'cors';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import express from 'express';
import helmet, { contentSecurityPolicy } from 'helmet';
import morgan from 'morgan';
import fs from 'node:fs';
import path from 'node:path';
import { appRouter } from './app.router';
import { dataSource } from './database/data-source';
import { DiscordClient } from './shared/shared.types';

dotenv.config();

const initDiscordClient = () => {
  const discordClient = new Client({
    intents: [GatewayIntentBits.Guilds],
  }) as DiscordClient;

  discordClient.commands = new Collection();

  const foldersPath = path.join(__dirname, 'commands');
  const commandFolders = fs.readdirSync(foldersPath);

  // Load commands
  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);

      if ('data' in command && 'execute' in command) {
        discordClient.commands.set(command.data.name, command);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
        );
      }
    }
  }

  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith('.js') || file.endsWith('.ts'));

  // Load events
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      discordClient.once(event.name, (...args) => event.execute(...args));
    } else {
      discordClient.on(event.name, (...args) => event.execute(...args));
    }
  }

  discordClient.login(process.env.BOT_TOKEN);
};

const initExpressServer = async () => {
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
    const url = `http://localhost:${process.env.PORT}`;
    console.log(`Server running at ${url} 🚀`);
  });
};

(async () => {
  await initExpressServer();
  initDiscordClient();
})();
