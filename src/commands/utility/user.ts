import { Interaction, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('user')
  .setDescription('Provides information about the user.');

export const execute = async (interaction: Interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  await interaction.reply(
    `This command was run by ${interaction.user.username}, who joined on ${interaction.user.createdAt}.`,
  );
};
