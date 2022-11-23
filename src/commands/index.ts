import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Collection,
  Interaction,
} from "discord.js";

import loadCommands from "../core/load-commands";
import Command from "../core/models/Command";

const commandCollection: Collection<string, Command> = new Collection();

loadCommands().forEach((command) => {
  commandCollection.set(command.config.name, command);
});

export async function executeSlashCommand(interaction: ChatInputCommandInteraction) {
  const requestedCommand = commandCollection.get(interaction.commandName);

  if (!requestedCommand) {
    await interaction.reply({
      content: `I don't recognize the command \`${interaction.commandName}\``,
    });
    return;
  }

  try {
    await requestedCommand.execute(interaction);
  } catch (e) {
    await interaction.reply("Something went wrong with my code, Operator. Sorry!");
    console.error(
      `An error ocurred when running "${interaction.commandName}". Error:`,
      e
    );
  }
}

export async function getAutocompleteSuggestions(interaction: AutocompleteInteraction) {
  const requestedCommand = commandCollection.get(interaction.commandName);

  if (!requestedCommand)
    return;

  try {
    await requestedCommand.autocomplete(interaction);
  } catch (e) {
    console.error(
      `An error ocurred when running "${interaction.commandName}". Error:`,
      e
    );
  }
}

export default commandCollection;
