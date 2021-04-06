import { Message, TextChannel } from "discord.js";

import { PREFIX } from "../constants";
import { WishlistCommand, UnknownCommand } from "../commands";

class CommandManager {
  private channel: TextChannel;

  constructor(channel: TextChannel) {
    this.channel = channel;
  }

  runCommand(command: string, args: string[]): void {
    switch (command) {
      case "wishlist":
        new WishlistCommand(this.channel).run(args);
        break;
      default:
        new UnknownCommand(this.channel).run();
        break;
    }
  }

  processCommand(message: Message): void {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    // get the message without the prefix
    const messageContent = message.content.substring(PREFIX.length);
    const [command, ...commandArgs] = messageContent.split(" ");

    this.runCommand(command, commandArgs);
  }
}

export default CommandManager;
