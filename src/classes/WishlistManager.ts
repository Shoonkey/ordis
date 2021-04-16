import * as fs from "fs";
import * as path from "path";
import { Message } from "discord.js";

import { DATA_FOLDER_PATH } from "../constants";

import Wishlist from "../interfaces/Wishlist";
import WishlistItem from "../interfaces/WishlistItem";
import { WishlistItemPart, WishlistItemType } from "../types/WishlistItemTypes";

class WishlistManager {
  private wishlistsFilePath = path.resolve(DATA_FOLDER_PATH, "wishlists.json");
  private wishlists = this.loadWishlists();
  private message: Message;

  constructor(message: Message) {
    this.message = message;
  }

  //#region [ rgba(155, 89, 182, 0.07) ] Wishlist

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
    if (this.getWishlist(title))
      throw new Error(`Já há uma wishlista chamada "${title}"`);

    const newWishlist: Wishlist = {
      title,
      author: this.message.author.username,
      items: [],
    };

    this.wishlists.push(newWishlist);
    this.save();
  }

  getWishlist(title: string): Wishlist | null {
    const wishlist = this.wishlists.find(
      (wishlist) => wishlist.title === title
    );

    return wishlist || null;
  }

  updateWishlistTitle(currentTitle: string, newTitle: string): void {
    const wishlist = this.getWishlist(currentTitle);

    if (!wishlist)
      throw new Error(
        `Não parece haver uma wishlista chamada "${currentTitle}"`
      );

    wishlist.title = newTitle;
    this.save();
  }

  removeWishlist(title: string): void {
    const wishlistIndex = this.wishlists.findIndex(
      (wishlist) => wishlist.title === title
    );

    if (wishlistIndex === -1)
      throw new Error(`Não parece haver uma wishlista chamada "${title}"`);

    this.wishlists.splice(wishlistIndex, 1);
    this.save();
  }

  save(): void {
    try {
      fs.writeFileSync(this.wishlistsFilePath, JSON.stringify(this.wishlists));
    } catch (e) {
      throw new Error("Não deu pra salvar as wishlistas");
    }
  }

  //#endregion

  //#region [ rgba(230, 126, 34, 0.07) ] Wishlist Item

  parseToWishlistItem(args: string[]): WishlistItem {
    const [name, part, type, quantity] = args;

    return {
      name: name,
      part: part as WishlistItemPart,
      type: type as WishlistItemType,
      quantity: Number(quantity),
    };
  }

  addWishlistItem(args: string[]): Wishlist {
    const wishlistTitle = args.shift();
    const item: WishlistItem = this.parseToWishlistItem(args);
    const wishlist = this.getWishlist(wishlistTitle);

    if (!wishlist)
      throw new Error(
        `Não parece haver uma wishlista chamada "${wishlistTitle}"`
      );

    wishlist.items.push(item);
    this.save();

    return wishlist;
  }

  updateWishlistItem<K extends keyof WishlistItem>(
    wishlistTitle: string,
    itemName: string,
    field: K,
    newValue: WishlistItem[K]
  ): void {
    const wishlist = this.getWishlist(wishlistTitle);

    if (!wishlist)
      throw new Error(
        `Não parece haver uma wishlista chamada "${wishlistTitle}"`
      );

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

    if (!wishlist)
      throw new Error(
        `Não parece haver uma wishlista chamada "${wishlistTitle}"`
      );

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

  //#endregion
}

export default WishlistManager;
