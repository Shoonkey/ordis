import { Message } from "discord.js";

abstract class Command {
  protected message: Message;
  private readonly TYPE_TIMEOUT = 2000;

  constructor(message: Message) {
    this.message = message;
  }

  type(message: string, typeTimeout: number = this.TYPE_TIMEOUT): void {
    this.message.channel.startTyping();

    setTimeout(() => {
      this.sendMessage(message);
      this.message.channel.stopTyping();
    }, typeTimeout);
  }

  sendMessage(message: string): void {
    this.message.channel.send(message);
  }

  abstract run(args: string[]): void;
}

export default Command;
