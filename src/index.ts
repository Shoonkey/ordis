import { config as loadEnvironment } from "dotenv";
import { Client, Events, GatewayIntentBits } from "discord.js";

import commands, { handleSlashCommand } from "./commands";

loadEnvironment();

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.on(Events.ClientReady, ({ user }) => {
  console.log(`Ready! Logged in as ${user.tag}`);
  client.application.commands.set(commands);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  await handleSlashCommand(interaction.client, interaction);
});

// Log in to Discord with your client's token
client.login(process.env.TOKEN);
