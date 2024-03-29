import isNumeric from "validator/lib/isNumeric";

import createCommand from "../core/create-command";
import formatItem from "../core/format-item";
import labels from "../core/labels";
import ItemType from "../core/models/ItemType";
import WishlistData from "../core/models/WishlistData";
import WishlistItem from "../core/models/WishlistItem";
import { getDataContent, setDataContent } from "../core/use-data-folder";
import getItemNameSuggestions from "../shared/autocomplete/item-name";

const Wish = createCommand({
  configureBuilder(builder) {
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
            option
              .setName("name")
              .setDescription("Item name")
              .setRequired(true)
              .setAutocomplete(true)
          )
          .addStringOption((option) =>
            option
              .setName("quantity")
              .setDescription("How many of this item do you need")
          );

        return builder;
      })
      .addSubcommand((builder) =>
        builder.setName("list").setDescription("List your current wishlist")
      )
      .addSubcommand((builder) =>
        builder.setName("clear").setDescription("Clear your current wishlist")
      )
      .addSubcommand((builder) =>
        builder
          .setName("remove")
          .setDescription("Remove items at given index or range of indices")
          .addStringOption((option) =>
            option
              .setName("range")
              .setDescription(
                "Index or range of indices (x-y) of items to delete"
              )
              .setRequired(true)
          )
      );
  },
  async execute(interaction) {
    let wishlistData: WishlistData;

    try {
      wishlistData = (await getDataContent("wishlists")) as WishlistData;
    } catch (e) {
      await interaction.reply(e.message);
      return;
    }

    const userID = interaction.user.id;

    if (!wishlistData[userID]) wishlistData[userID] = [];

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "save") {
      const itemType = interaction.options.getString("type") as ItemType;
      const itemName = interaction.options.getString("name");
      const itemQuantity = interaction.options.getString("quantity");

      if (itemQuantity && !isNumeric(itemQuantity)) {
        await interaction.reply(
          `_${itemQuantity}_ should be numeric, Operator. What's this about?`
        );
        return;
      }

      const parsedQuantity = itemQuantity ? parseInt(itemQuantity, 10) : undefined;
      const requestedItems: WishlistItem[] = [];

      if (!labels[itemType]) {
        await interaction.reply(
          `I don't recognize the item type \`${itemType}\``
        );
        return;
      }

      if (itemType === "wf")
        ["bp", "n", "c", "sys"].forEach((type: ItemType) => {
          requestedItems.push({ quantity: parsedQuantity, type, name: itemName });
        });
      else requestedItems.push({ quantity: parsedQuantity, type: itemType, name: itemName });

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

      try {
        await setDataContent("wishlists", wishlistData);
      } catch (e) {
        await interaction.reply(e.message);
        return;
      }

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
    } else if (subcommand === "list") {
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
    } else if (subcommand === "clear") {
      wishlistData[userID] = [];

      try {
        await setDataContent("wishlists", wishlistData);
      } catch (e) {
        await interaction.reply(e.message);
        return;
      }

      await interaction.reply("WisHLIsT PurgED, OpErAtor.");
    } else if (subcommand === "remove") {
      const range = interaction.options.getString("range");

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

      try {
        await setDataContent("wishlists", wishlistData);
      } catch (e) {
        await interaction.reply(e.message);
        return;
      }

      if (start === end)
        await interaction.reply(`Item thrown to space, operator.`);
      else
        await interaction.reply(
          "Items discarded successfully. May I discard these old argons too?"
        );
    }
  },
  async autocomplete(interaction) {
    const focusedAutocompleteOption = interaction.options.getFocused(true);

    if (focusedAutocompleteOption.name === "name") {
      const suggestions = await getItemNameSuggestions({
        name: focusedAutocompleteOption.value,
        type: interaction.options.getString("type") as ItemType,
      });

      await interaction.respond(suggestions);
    }
  },
});

export default Wish;
