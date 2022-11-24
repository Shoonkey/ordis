import path from "path";
import { config as loadEnvironment } from "dotenv";
import { Client, Events, GatewayIntentBits } from "discord.js";

import { executeSlashCommand, getAutocompleteSuggestions } from "./commands";

loadEnvironment({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
});

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
  if (interaction.isChatInputCommand())
    await executeSlashCommand(interaction);
  else if (interaction.isAutocomplete())
    await getAutocompleteSuggestions(interaction);
  else
    await interaction.reply(
      "Are you alright, Operator?! Your request seems corrupted"
    );

});
