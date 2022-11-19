import { SlashCommandBuilder, CommandInteraction } from "discord.js";

export default interface Command {
  config: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
}
