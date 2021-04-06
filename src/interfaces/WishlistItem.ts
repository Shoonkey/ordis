export default interface WishlistItem {
  name: string;
  type: "warframe" | "primary" | "secondary" | "melee" | "archwing";
  quantity: number;
}
