import Command from "../classes/Command";

class UnknownCommand extends Command {
  run(): void {
    this.type("...");
    this.type(
      "Me chamou...? Eu não sei que comando é esse aí não. :flushed: :point_right: :point_left:"
    );
  }
}

export default UnknownCommand;
