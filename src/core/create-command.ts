import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import Command from "./models/Command";

interface CreateCommandProps {
  configureBuilder: (builder: SlashCommandBuilder) => void;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

export default function createCommand({
  configureBuilder,
  execute,
  autocomplete
}: CreateCommandProps): Command {
  const builder = new SlashCommandBuilder();
  configureBuilder(builder);

  const command: Command = { config: builder, execute };

  if (autocomplete)
    command.autocomplete = autocomplete;

  return command;
}