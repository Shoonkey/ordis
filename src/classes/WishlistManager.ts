import * as fs from "fs";
import * as path from "path";

import { DATA_FOLDER_PATH } from "../constants";

import Wishlist from "../interfaces/Wishlist";
import WishlistItem from "../interfaces/WishlistItem";

class WishlistManager {
  private wishlistsFilePath = path.resolve(DATA_FOLDER_PATH, "wishlists.json");
  private wishlists = this.loadWishlists();

  loadWishlists(): Wishlist[] {
    let wishlists = [] as Wishlist[];

    try {
      if (!fs.existsSync(DATA_FOLDER_PATH)) fs.mkdirSync(DATA_FOLDER_PATH);

      if (fs.existsSync(this.wishlistsFilePath))
        wishlists = JSON.parse(
          fs.readFileSync(this.wishlistsFilePath, { encoding: "utf8" })
        );
      else fs.writeFileSync(this.wishlistsFilePath, JSON.stringify(wishlists));

      return wishlists;
    } catch (e) {
      throw new Error(
        "Não consegui carregar as wishlistas. Meu Codex deve estar corrompido... Bip bop."
      );
    }
  }

  addWishlist(title: string): void {
    const newWishlist: Wishlist = { title, items: [] };
    this.wishlists.push(newWishlist);
    this.save();
  }

  getWishlist(title: string): Wishlist {
    const wishlist = this.wishlists.find(
      (wishlist) => wishlist.title === title
    );

    if (!wishlist)
      throw new Error(`Não parece haver uma wishlista chamada "${title}"`);

    return wishlist;
  }

  updateWishlistTitle(currentTitle: string, newTitle: string): void {
    const wishlist = this.getWishlist(currentTitle);
    wishlist.title = newTitle;
    this.save();
  }

  removeWishlist(title: string): void {
    const wishlistIndex = this.wishlists.findIndex(
      (wishlist) => wishlist.title === title
    );

    if (!wishlistIndex)
      throw new Error(`Parece que já não há uma wishlist "${title}"`);

    this.wishlists.splice(wishlistIndex, 1);
    this.save();
  }

  addWishlistItem(wishlistTitle: string, item: WishlistItem): void {
    const wishlist = this.getWishlist(wishlistTitle);
    wishlist.items.push(item);
    this.save();
  }

  updateWishlistItem<K extends keyof WishlistItem>(
    wishlistTitle: string,
    itemName: string,
    field: K,
    newValue: WishlistItem[K]
  ): void {
    const wishlist = this.getWishlist(wishlistTitle);
    const wishlistItem = wishlist.items.find((item) => item.name === itemName);

    if (!wishlistItem)
      throw new Error(
        `Não encontrei nenhum "${itemName}" na lista "${wishlistTitle}"`
      );

    wishlistItem[field] = newValue;
    this.save();
  }

  removeWishlistItem(wishlistTitle: string, itemName: string): void {
    const wishlist = this.getWishlist(wishlistTitle);
    const itemIndex = wishlist.items.findIndex(
      (item) => item.name === itemName
    );

    if (!itemIndex)
      throw new Error(
        `Parece que já não há nenhum "${itemName}" na lista "${wishlistTitle}`
      );

    wishlist.items.splice(itemIndex, 1);
    this.save();
  }

  save(): void {
    try {
      fs.writeFileSync(this.wishlistsFilePath, JSON.stringify(this.wishlists));
    } catch (e) {
      throw new Error("Não deu pra salvar as wishlistas");
    }
  }
}

export default WishlistManager;
