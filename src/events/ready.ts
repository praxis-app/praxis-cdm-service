import { Client, Events } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;

export const execute = (client: Client<true>) => {
  console.log(`Logged in as ${client.user.tag} 🤖`);
};
