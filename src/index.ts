import { config as loadEnvironment } from "dotenv";
import { Client, Events, GatewayIntentBits } from "discord.js";

import { handleSlashCommand } from "./commands";
import deployCommands from "./deploy-commands";

loadEnvironment();
deployCommands();

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Log in to Discord with your client's token
client.login(process.env.TOKEN);

client.on(Events.ClientReady, ({ user }) => {
  console.log(`Ready! Logged in as ${user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  await handleSlashCommand(interaction);
});
