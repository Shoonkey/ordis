import WishlistItem from "./WishlistItem";

export default interface WishlistData {
  [userID: string]: WishlistItem[]
}