import Item from "../shared/models/item";
import labels from "./labels";

function formatItem(item: Item) {

  const label = labels[item.type];

  if (!label)
    throw new Error(`Invalid single item type "${item.type}"`);

  const capitalizeWord = (word: string) =>
    word[0].toUpperCase() + word.substring(1);

  const capitalizedItemName = item.name
    .split(" ")
    .map(capitalizeWord)
    .join(" ");

  return `${capitalizedItemName}/${label}`;
}

export default formatItem;