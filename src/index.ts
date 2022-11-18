import { config as loadEnvironment } from "dotenv";
import { Events, GatewayIntentBits } from "discord.js";

import commands, { handleSlashCommand } from "./commands";
import DiscordClient from "./core/models/DiscordClient";
import deployCommands from "./core/deploy-commands";

loadEnvironment();
deployCommands();

// Create a new client instance
const client = new DiscordClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
client.commands = commands;

// Log in to Discord with your client's token
client.login(process.env.TOKEN);

client.on(Events.ClientReady, ({ user }) => {
  console.log(`Ready! Logged in as ${user.tag}`);

});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  await handleSlashCommand(interaction.client, interaction);
});
