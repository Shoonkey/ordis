import { Client, CommandInteraction } from "discord.js";

import { Command } from "../core/Command";
import Ping from "./ping";

const commands: Command[] = [Ping];

export async function handleSlashCommand(
  client: Client,
  interaction: CommandInteraction
) {
  const requestedCommand = commands.find(
    (c) => c.name === interaction.commandName
  );

  if (!requestedCommand) {
    interaction.followUp({
      content: `I don't recognize the command \`${interaction.commandName}\``,
    });

    return;
  }

  await interaction.deferReply();
  requestedCommand.run(client, interaction);
}

export default commands;
