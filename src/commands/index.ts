import { Collection, CommandInteraction } from "discord.js";
import loadCommands from "../core/load-commands";

const commandCollection: Collection<any, any> = new Collection();

loadCommands()
  .forEach(command => {
    commandCollection.set(command.config.name, command);
  })

export async function handleSlashCommand(interaction: CommandInteraction) {
  const requestedCommand = commandCollection.get(interaction.commandName);

  if (!requestedCommand) {
    await interaction.followUp({
      content: `I don't recognize the command \`${interaction.commandName}\``,
    });

    return;
  }

  await requestedCommand.execute(interaction);
}

export default commandCollection;
