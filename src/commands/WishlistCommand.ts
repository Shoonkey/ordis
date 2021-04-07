import Command from "../classes/Command";
import WishlistManager from "../classes/WishlistManager";
import UnknownCommand from "./UnknownCommand";

class WishlistCommand extends Command {
  private manager = new WishlistManager();

  printAllLists(): void {
    const wishlists = this.manager.loadWishlists();

    if (wishlists.length === 0) {
      this.sendMessage(
        "Não há nenhuma wishlista warfremística no meu Codex... _ainda_."
      );
      return;
    }

    this.sendMessage(`
      **Wishlistas warfremísticas**
      ${wishlists.map(
        (wishlist) =>
          `- ${wishlist.title} (${
            wishlist.author ? `@${wishlist.author}` : "alguém"
          }, ${wishlist.items.length} itens)`
      )}
    `);
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
        this.channel.send("Wishlista adicionada!");
        break;
      default:
        new UnknownCommand(this.channel).run();
    }
  }
}

export default WishlistCommand;
