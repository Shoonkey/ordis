import { config as loadEnvironment } from "dotenv";
import { REST, Routes } from "discord.js";

import loadCommands from "./core/load-commands";

loadEnvironment();

async function deployCommands() {
  if (!process.env.CLIENT_ID)
    throw new Error("Client ID not found in environment file");
  if (!process.env.GUILD_ID)
  throw new Error("Guild ID not found in environment file");

  const commandData = loadCommands().map((command) => command.config.toJSON());

  // Construct and prepare an instance of the REST module
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {

    if (process.env.NODE_ENV === "development") {
      if (!process.env.GUILD_ID)
        throw new Error(
          "A guild ID must be informed in the environment file for development mode"
        );

      // Refresh commands in development server
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        { body: commandData }
      );
    } else {
      // Clear guild commands so that there is no duplicates
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        { body: [] }
      );

      // Refresh commands in all servers bot is in
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commandData,
      });
    }
  } catch (error) {
    console.error(error);
  }
}

deployCommands()
  .then(() => console.log(`[${process.env.NODE_ENV}] Commands deployed`))
  .catch((err) =>
    console.error(
      `[${process.env.NODE_ENV}] Failed to deploy commands. Error:`,
      err
    )
  );
