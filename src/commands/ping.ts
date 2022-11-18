import { Client, CommandInteraction, ApplicationCommandType } from "discord.js";

import { Command } from "../core/Command";

const Ping: Command = {
  name: "ping",
  description: "Replies with Pong!",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {
    await interaction.followUp({
      ephemeral: true,
      content: "PONG PORRA",
    });
  },
};

export default Ping;
