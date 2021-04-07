import Command from "../classes/Command";
import WishlistManager from "../classes/WishlistManager";
import UnknownCommand from "./UnknownCommand";

class WishlistCommand extends Command {
  private manager = new WishlistManager(this.message);

  printAllLists(): void {
    const wishlists = this.manager.loadWishlists();

    if (wishlists.length === 0) {
      this.sendMessage(
        "Não há nenhuma wishlista warfremística no meu Codex... _ainda_."
      );
      return;
    }

    let message = "**Wishlistas warfremísticas**\n";

    wishlists.forEach(({ title, author, items }) => {
      const itemCount = items.length;
      const itemNoun = itemCount === 1 ? "item" : "itens";

      message += `\t- ${title} (@${author}, ${itemCount} ${itemNoun})\n`;
    });

    this.sendMessage(message);
  }

  run(args: string[]): void {
    if (args.length === 0) {
      this.printAllLists();
      return;
    }

    const [command, ...commandArgs] = args;

    switch (command) {
      case "add":
        this.manager.addWishlist(commandArgs[0]);
        this.sendMessage("Wishlista adicionada!");
        break;
      default:
        new UnknownCommand(this.message).run();
    }
  }
}

export default WishlistCommand;
