import { existsSync } from "fs";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import isNumeric from "validator/lib/isNumeric";

import createCommand from "../core/create-command";
import formatItem from "../core/format-item";
import labels from "../core/labels";
import ItemType from "../core/models/ItemType";
import WishlistData from "../core/models/WishlistData";
import WishlistItem from "../core/models/WishlistItem";

const Wish = createCommand(
  (builder) => {
    builder
      .setName("wish")
      .setDescription("Modifies or list the user's wishlist.")
      .addSubcommand((builder) => {
        const itemTypeChoices = Object.entries(labels).map(([value, name]) => ({
          name,
          value,
        }));

        builder
          .setName("save")
          .setDescription("Save item to wishlist")
          .addStringOption((option) =>
            option
              .setName("type")
              .setDescription("Item type")
              .setRequired(true)
              .addChoices(...itemTypeChoices)
          )
          .addStringOption((option) =>
            option.setName("name").setDescription("Item name").setRequired(true)
          );

        return builder;
      })
      .addSubcommand((builder) => {
        builder.setName("list").setDescription("List your current wishlist");

        return builder;
      })
      .addSubcommand((builder) => {
        builder.setName("clear").setDescription("Clear your current wishlist");

        return builder;
      })
      .addSubcommand((builder) => {
        builder
          .setName("remove")
          .setDescription("Remove items according to the given range")
          .addStringOption((option) =>
            option
              .setName("range")
              .setDescription("Range of indexes to delete (x-y)")
              .setRequired(true)
          );
        return builder;
      });
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

      const requestedItems: WishlistItem[] = [];

      if (!labels[itemType]) {
        await interaction.reply(
          `I don't recognize the item type \`${itemType}\``
        );asdfasdf
        return;
      }

      if (itemType === "wf")
        ["bp", "n", "c", "s"].forEach((type: ItemType) => {
          requestedItems.push({ type, name: itemName });
        });
      else
        requestedItems.push({ type: itemType, name: itemName });

      const itemsToAdd = [];
      const itemsAlreadyInWishlist = [];

      for (const requestedItem of requestedItems) {
        if (
          wishlistData[userID].find((item) => {
            return (
              item.name.toLowerCase() === requestedItem.name.toLowerCase() &&
              item.type === requestedItem.type
            );
          })
        )
          itemsAlreadyInWishlist.push(requestedItem);
        else itemsToAdd.push(requestedItem);
      }

      if (itemsToAdd.length === 0) {
        await interaction.reply(
          "The items you wished for are already in your wishlist."
        );
        return;
      }

      wishlistData[userID].push(...itemsToAdd);
      await writeFile(wishlistFilePath, JSON.stringify(wishlistData), "utf8");

      await interaction.reply(
        "Added some items to your wishlist! Here they are:\n" +
          itemsToAdd.map((item) => `- \`${formatItem(item)}\``).join("\n")
      );

      if (itemsAlreadyInWishlist.length > 0)
        await interaction.followUp(
          "Some of the items were already in your wishlist:\n" +
            itemsAlreadyInWishlist
              .map((item) => `- \`${formatItem(item)}\``)
              .join("\n")
        );
    } else if (subcommand.name === "list") {
      const items = wishlistData[userID]
        .map((item) => `- \`${formatItem(item)}\``)
        .join("\n");

      if (items === "") {
        await interaction.reply(
          "Operator, your wishlist is just like a Grineer head... Empty!"
        );
        return;
      }

      await interaction.reply("Here's your wishlist, Operator:\n" + items);
    } else if (subcommand.name === "clear") {
      wishlistData[userID] = [];
      await writeFile(wishlistFilePath, JSON.stringify(wishlistData), "utf8");
      await interaction.reply("WisHLIsT PurgED, OpErAtor.");
    } else if (subcommand.name === "remove") {
      const range = interaction.options.get("range").value as string;

      const [startStr, endStr] = range.split("-");

      if (!isNumeric(startStr) || (endStr && !isNumeric(endStr))) {
        await interaction.reply(
          "Your range seems... weird, Operator. I couldn't parse it properly."
        );
        return;
      }

      // If inputted n for start or end, true value is n - 1 due to indexing starting at 0
      const start = parseInt(startStr, 10) - 1;
      const end = endStr ? parseInt(endStr, 10) - 1 : start;

      if (start > end) {
        await interaction.reply(
          `I don't think you really meant the range \`${start + 1}-${
            end + 1
          }\`, Operator. ` +
            "How am I supposed to start deleting after the range end?"
        );

        return;
      }

      if (
        start >= wishlistData[userID].length ||
        end >= wishlistData[userID].length
      ) {
        await interaction.reply(
          "Your range seems a bit odd, Operator. You only have " +
            wishlistData[userID].length +
            (wishlistData[userID].length > 1 ? " items " : " item ") +
            "in your wishlist currently but you requested " +
            `removing the ${
              start === end
                ? `item \`#${start + 1}\``
                : `range \`${start + 1}-${end + 1}\``
            }`
        );

        return;
      }

      wishlistData[userID].splice(start, end - start + 1);
      await writeFile(wishlistFilePath, JSON.stringify(wishlistData), "utf8");

      if (start === end)
        await interaction.reply(`Item thrown to space, operator.`);
      else
        await interaction.reply(
          "Items discarded successfully. May I discard these old argons too?"
        );
    }
  }
);

export default Wish;
