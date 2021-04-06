import { TextChannel } from "discord.js";

abstract class Command {
  protected channel: TextChannel;
  private readonly TYPE_TIMEOUT: number = 2000;

  constructor(channel: TextChannel) {
    this.channel = channel;
  }

  type(message: string, typeTimeout: number = this.TYPE_TIMEOUT): void {
    this.channel.startTyping();

    setTimeout(() => {
      this.sendMessage(message);
      this.channel.stopTyping();
    }, typeTimeout);
  }

  sendMessage(message: string): void {
    this.channel.send(message);
  }

  abstract run(args: string[]): void;
}

export default Command;
