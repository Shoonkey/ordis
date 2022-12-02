import ItemType from "./ItemType";

export default interface WishlistItem {
  type: ItemType;
  name: string;
  quantity: number;
}