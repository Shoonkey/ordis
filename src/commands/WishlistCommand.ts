import Command from "../classes/Command";
import Wishlist from "../interfaces/Wishlist";

class WishlistCommand extends Command {
  loadWishlists(): Wishlist[] {
    return [];
  }

  printAllLists() {
    const wishlists = this.loadWishlists();

    if (wishlists.length === 0) {
      this.sendMessage(
        "Não há nenhuma wishlista warfremística no meu Codex... _ainda_."
      );
      return;
    }

    this.sendMessage(`
      > *Wishlistas warfremísticas*
      ${wishlists.map(
        (wishlist) =>
          `- ${wishlist.title} (@${wishlist.author}, ${wishlist.items.length} itens)`
      )}
    `);
  }

  run(args: string[]) {
    if (args.length === 0) {
      this.printAllLists();
      return;
    }
  }
}

export default WishlistCommand;
