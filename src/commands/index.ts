import { Client, Collection, CommandInteraction } from "discord.js";

import Ping from "./ping";
import Wish from "./wish";

const commands: Collection<any, any> = new Collection();
commands.set("ping", Ping);
commands.set("wish", Wish);

export async function handleSlashCommand(interaction: CommandInteraction) {
  const requestedCommand = commands.get(interaction.commandName);

  if (!requestedCommand) {
    await interaction.followUp({
      content: `I don't recognize the command \`${interaction.commandName}\``,
    });

    return;
  }

  await requestedCommand.execute(interaction);
}

export default commands;
