import { Message } from "discord.js";

import { PREFIX } from "./constants";

async function processMessage(message: Message): Promise<void> {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const messageContent = message.content.substring(PREFIX.length); // get the message without the prefix
  const [command, ...args] = messageContent.split(" ");

  switch (command) {
    case "wishlist":
      console.log("command args:", args);
      message.channel.send("Comando `wishlist` ainda não implementado");
      break;
    default:
      message.channel.send(
        `Bem se pá que eu não tenho um comando ${messageContent} não, viu... :flushed:`
      );
  }
}

export default processMessage;
