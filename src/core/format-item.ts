import labels from "./labels";
import WishlistItem from "./models/WishlistItem";

function formatItem(item: WishlistItem) {

  const label = labels[item.type];

  if (!label)
    throw new Error(`Invalid single item type "${item.type}"`);

  const capitalizeWord = (word: string) =>
    word[0].toUpperCase() + word.substring(1);

  const capitalizedItemName = item.name
    .split(" ")
    .map(capitalizeWord)
    .join(" ");

  return `${capitalizedItemName}/${label} (${item.quantity || 1}x)`;
}

export default formatItem;