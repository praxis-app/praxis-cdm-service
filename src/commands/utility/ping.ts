import { Interaction, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

export const execute = async (interaction: Interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  await interaction.reply('Pong!');
};
