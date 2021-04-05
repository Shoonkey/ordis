import { Message } from "discord.js";

import { PREFIX } from "./constants";

export function processMessage(message: Message): void {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  message.channel.send("poggers! :0");
}
