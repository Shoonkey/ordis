import { WishlistItemPart, WishlistItemType } from "../types/WishlistItemTypes";

export default interface WishlistItem {
  name: string;
  part: WishlistItemPart;
  type: WishlistItemType;
  quantity: number;
}
