import { config as loadEnvironment } from "dotenv";
import { Client, Events, GatewayIntentBits } from "discord.js";

import { handleSlashCommand } from "./commands";

loadEnvironment();

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Log in to Discord with your client's token
client.login(process.env.TOKEN);

client.on(Events.ClientReady, ({ user }) => {
  console.log(`[${process.env.NODE_ENV}] Ready! Logged in as ${user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  await handleSlashCommand(interaction);
});
