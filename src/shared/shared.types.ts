import type { Collection, Client } from 'discord.js';

export interface DiscordClient extends Client {
  commands: Collection<unknown, any>;
}
