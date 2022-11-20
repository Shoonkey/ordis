import { existsSync } from "fs";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";

import createCommand from "../core/create-command";
import ItemType from "../core/models/ItemType";
import WishlistData from "../core/models/WishlistData";
import WishlistItem from "../core/models/WishlistItem";
import Item from "../shared/models/item";

function formatItem(item: Item) {

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
  
  const capitalizeWord = (word: string) => word[0].toUpperCase() + word.substring(1);
  const capitalizedItemName = item.name.split(" ").map(capitalizeWord).join(" ");

  return `${capitalizedItemName}/${getLabel(item.type as ItemType)}`;

}

const Wish = createCommand(
  (builder) => {
    builder
      .setName("wish")
      .setDescription("Modifies or list the user's wishlist.")
      .addSubcommand(builder => {
        builder
          .setName("save")
          .setDescription("Save item to wishlist")
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

          return builder;
      })
      .addSubcommand(builder => {
        builder
          .setName("list")
          .setDescription("List your current wishlist")

        return builder;
      })
      .addSubcommand(builder => {
        builder
          .setName("clear")
          .setDescription("Clear your current wishlist")

        return builder;
      })
      .addSubcommand(builder => {
        builder
          .setName("remove")
          .setDescription("Remove items according to the given range")
          .addStringOption((option) =>
            option.setName("range")
            .setDescription("Range of indexes to delete (x-y)")
            .setRequired(true)
          );
        return builder;
      })
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
      
    const userID = interaction.user.id;

    if (!wishlistData[userID]) wishlistData[userID] = [];
    
    const subcommand = interaction.options.data[0];
    
    if (subcommand.name === "save") {

      const itemType = interaction.options.get("type").value as ItemType;
      const itemName = interaction.options.get("name").value as string;
  
      let isTypeInvalid = false;
      const requestedItems: WishlistItem[] = [];
  
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
          requestedItems.push({ type: itemType, name: itemName });
          break;
  
        // handles salving of multiple items
        case "wf":
          ["bp", "n", "c", "s"].forEach((type: ItemType) => {
            requestedItems.push({ type, name: itemName });
          });
          break;
        case "w":
          ["h", "b", "br"].forEach((type: ItemType) => {
            requestedItems.push({ type, name: itemName });
          })
          break;
        
        default:
          isTypeInvalid = true;
      }
  
      if (isTypeInvalid) {
        await interaction.reply(`I don't recognize the item type \`${itemType}\``);
        return;
      }

      const itemsToAdd = [];
      const itemsAlreadyInWishlist = [];

      for (const requestedItem of requestedItems) {

        if (
          wishlistData[userID].find(item => {
            return  item.name.toLowerCase() === requestedItem.name.toLowerCase() && 
                    item.type === requestedItem.type;
          })
        )
          itemsAlreadyInWishlist.push(requestedItem);
        else
          itemsToAdd.push(requestedItem);
 
      }

      if (itemsToAdd.length === 0) {
        await interaction.reply("The items you wished for are already in your wishlist.");
        return;
      }
  
      wishlistData[userID].push(...itemsToAdd);
      await writeFile(wishlistFilePath, JSON.stringify(wishlistData), "utf8");
  
      await interaction.reply(
        "Added some items to your wishlist! Here they are:\n" +
        itemsToAdd.map(item => `- \`${formatItem(item)}\``).join("\n")
      );

      if (itemsAlreadyInWishlist.length > 0)
        await interaction.followUp(
          "Some of the items were already in your wishlist:\n" +
          itemsAlreadyInWishlist.map(item => `- \`${formatItem(item)}\``).join("\n")
        );

    } else if (subcommand.name === "list") {
      const items = wishlistData[userID]
        .map(item => `- \`${formatItem(item)}\``)
        .join("\n");
      
      if (items === "") {
        await interaction.reply("Operator, your wishlist is just like a Grineer head... Empty!");
        return;
      }

      await interaction.reply(
        "Here's your wishlist, operator:\n" + items
      );

    } else if (subcommand.name === "clear") {
      wishlistData[userID] = [];
      await writeFile(wishlistFilePath, JSON.stringify(wishlistData), "utf8");
      await interaction.reply("WisHLIsT PurgED, OpErAtor.");

    } else if (subcommand.name === "remove") {
      const range = interaction.options.get("type").value as string;
      const rangeSplitted = range.split("-");

      if (rangeSplitted.length === 1) {
        wishlistData[userID] = wishlistData[userID]
          .splice(Number(rangeSplitted[0]), 1);

        await writeFile(wishlistFilePath, JSON.stringify(wishlistData), "utf8");
        await interaction.reply("Item thrown to space, operator.");
        return;
      }

      const start = Number(rangeSplitted[0]);
      const numberOfItems = Number(rangeSplitted[1]) - start;

      wishlistData[userID] = wishlistData[userID]
        .splice(start, numberOfItems);

      await writeFile(wishlistFilePath, JSON.stringify(wishlistData), "utf8");
      await interaction.reply("Items discarded successfully. May I discard these old argons too?");

    }

  }
);

export default Wish;
