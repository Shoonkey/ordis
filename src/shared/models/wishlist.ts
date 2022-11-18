import { User } from "discord.js";
import Item from "./item";

export default interface Wishlist {
    user?: User,
    userId: number;
    Items: Item[];
}