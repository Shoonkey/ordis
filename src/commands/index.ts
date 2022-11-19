import { Collection, CommandInteraction } from "discord.js";

import loadCommands from "../core/load-commands";

const commandCollection: Collection<any, any> = new Collection();

loadCommands().forEach((command) => {
  commandCollection.set(command.config.name, command);
});

export async function handleSlashCommand(interaction: CommandInteraction) {
  const requestedCommand = commandCollection.get(interaction.commandName);

  if (!requestedCommand) {
    await interaction.followUp({
      content: `I don't recognize the command \`${interaction.commandName}\``,
    });

    return;
  }

  try {
    await requestedCommand.execute(interaction);
  } catch (e) {
    console.error(
      `An error ocurred when running "${interaction.commandName}". Error:`,
      e
    );
  }
}

export default commandCollection;
