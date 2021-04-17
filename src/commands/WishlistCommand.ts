import Command from "../classes/Command";
import WishlistManager from "../classes/WishlistManager";
import Wishlist from "../interfaces/Wishlist";
import UnknownCommand from "./UnknownCommand";

class WishlistCommand extends Command {
  private manager = new WishlistManager(this.message);

  printAllLists(): void {
    let wishlists: Wishlist[];

    try {
      wishlists = this.manager.loadWishlists();
    } catch (e) {
      this.sendMessage(e.message);
      return;
    }

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

  printList(title: string): void {
    const wishlist = this.manager.getWishlist(title);

    if (!wishlist)
      this.message.channel.send(
        `Não parece haver uma wishlista chamada "${title}"`
      );

    let message = `**${title}**\n`;

    if (wishlist.items.length === 0) message += "\tSem itens";
    else
      wishlist.items.forEach(({ name, part, quantity }) => {
        message += `\t- ${quantity}x ${name}'s ${part};\n`;
      });

    this.sendMessage(message);
  }

  run(args: string[]): void {
    if (args.length === 0) {
      this.printAllLists();
      return;
    }

    const [command, ...commandArgs] = args;

    try {
      switch (command) {
        case "add":
          this.manager.addWishlist(commandArgs[0]);
          this.sendMessage("Wishlista adicionada!");
          break;
        case "addItem":
          this.manager.addWishlistItem(commandArgs);
          this.sendMessage("Item scaneado!");
          break;
        case "show":
          this.printList(commandArgs[0]);
          break;
        case "drop":
          this.manager.removeWishlist(commandArgs[0]);
          this.sendMessage("Wishlista removida!");
          break;
        default:
          new UnknownCommand(this.message).run();
      }
    } catch (e) {
      this.sendMessage(e.message);
    }
  }
}

export default WishlistCommand;
