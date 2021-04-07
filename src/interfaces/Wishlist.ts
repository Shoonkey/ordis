import WishlistItem from "./WishlistItem";

export default interface Wishlist {
  title: string;
  author?: string;
  items: WishlistItem[];
}
