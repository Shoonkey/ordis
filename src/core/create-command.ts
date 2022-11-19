import { CommandInteraction, SlashCommandBuilder } from "discord.js";

import Command from "./models/Command";

export default function createCommand(
  configureBuilder: (builder: SlashCommandBuilder) => void, 
  execute: (interaction: CommandInteraction) => Promise<void>
): Command {
  const builder = new SlashCommandBuilder();
  configureBuilder(builder);

  return { config: builder, execute };
}