import { Message } from "discord.js";

import { PREFIX } from "../constants";
import { UnknownCommand } from "../commands";
import Command from "./Command";

interface CommandDescriptor {
  name: string;
  command: Command;
}

class CommandManager {
  private message: Message;
  private commandDescriptors: CommandDescriptor[];

  constructor(message: Message, commandDescriptors: CommandDescriptor[]) {
    this.message = message;
    this.commandDescriptors = commandDescriptors;
  }

  runCommand(command: string, args: string[]): void {
    const descriptor = this.commandDescriptors.find(
      (descriptor) => descriptor.name === command
    );

    if (!descriptor) {
      new UnknownCommand(this.message).run();
      return;
    }

    descriptor.command.run(args);
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
