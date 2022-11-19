import { existsSync } from "fs";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";

import createCommand from "../core/create-command";
import ItemType from "../core/models/ItemType";
import WishlistData from "../core/models/WishlistData";
import WishlistItem from "../core/models/WishlistItem";
import Item from "../shared/models/item";

function formatAddedItem(item: Item) {

  const getLabel = (itemType: ItemType) => {
    switch(itemType) {
      case "bp":
        return "Blueprint";
      case "n":
        return "Neuroptics";
      case "c":
        return "Chassis";
      case "s":
        return "Systems";
      case "h":
        return "Handle";
      case "b":
        return "Blade";
      case "br":
        return "Barrel";
      default:
        throw new Error(`Invalid single item type "${itemType}"`);
    }
  }

  return `${item.name}/${getLabel(item.type as ItemType)}`;

}

const Wish = createCommand(
  (builder) => {
    builder
      .setName("wish")
      .setDescription("Modifies or list the user's wishlist.")
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("Item type")
          .setRequired(true)
          .addChoices(
            // general options
            { name: "Blueprint", value: "bp" },
            { name: "Warframe", value: "wf" },
            { name: "Weapon", value: "w" },
            // warframe options
            { name: "Neuroptics", value: "n" },
            { name: "Chassis", value: "c" },
            { name: "System", value: "s" },
            // weapon options
            { name: "Handle", value: "h" },
            { name: "Blade", value: "b" },
            { name: "Barrel", value: "br" }
          )
      )
      .addStringOption((option) =>
        option.setName("name").setDescription("Item name").setRequired(true)
      );
  },
  async (interaction) => {
    const dataFolderPath = path.join(__dirname, "../../data");
    const wishlistFilePath = `${dataFolderPath}/wishlists.json`;

    // Ensure data folder exists and wishlist file is in it
    if (!existsSync(dataFolderPath)) await mkdir(dataFolderPath);
    if (!existsSync(wishlistFilePath))
      await writeFile(wishlistFilePath, "{}", "utf8");

    const wishlistData: WishlistData = JSON.parse(
      await readFile(wishlistFilePath, "utf8")
    );

    const itemType = interaction.options.get("type").value as ItemType;
    const itemName = interaction.options.get("name").value as string;
    const userID = interaction.user.id;

    if (!wishlistData[userID]) wishlistData[userID] = [];

    let isTypeInvalid = false;
    const itemsToAdd: WishlistItem[] = [];

    switch (itemType) {

      // handles saving for single items
      case "w":
      case "bp":
      case "n":
      case "c":
      case "s":
      case "h":
      case "b":
      case "br":
        itemsToAdd.push({ type: itemType, name: itemName });
        break;

      // handles salving of multiple items
      case "wf":
        ["bp", "n", "c", "s"].forEach((type: ItemType) => {
          itemsToAdd.push({ type, name: itemName });
        });
        break;
      case "w":
        ["h", "b", "br"].forEach((type: ItemType) => {
          itemsToAdd.push({ type, name: itemName });
        })
        break;
      
      default:
        isTypeInvalid = true;
    }

    if (isTypeInvalid) {
      await interaction.reply(`I don't recognize the item type \`${itemType}\``);
      return;
    }

    wishlistData[userID].push(...itemsToAdd);
    await writeFile(wishlistFilePath, JSON.stringify(wishlistData), "utf8");

    await interaction.reply(
      "Added some items to your wishlist! Here they are:\n" +
      itemsToAdd.map(item => `- \`${formatAddedItem(item)}\`\n`)
    );

  }
);

export default Wish;
