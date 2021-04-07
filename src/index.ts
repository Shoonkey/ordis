import * as dotenv from "dotenv";
import { Client } from "discord.js";

import CommandManager from "./classes/CommandManager";
import { WishlistCommand } from "./commands";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const client = new Client();

client.once("ready", () => console.log("Connected."));

client.on("message", (message) => {
  if (message.channel.type !== "text") {
    message.channel.send("Tipo de canal não suportado :flushed:");
    return;
  }

  const manager = new CommandManager(message, [
    { name: "wishlist", command: new WishlistCommand(message) },
  ]);

  manager.processCommand(message);
});

client.login(process.env.TOKEN);
