import { ApplicationCommandOptionChoiceData } from "discord.js";
import WFItems, { Category } from "warframe-items";

import ItemType from "../../core/models/ItemType";

interface ItemData {
  name: string;
  type?: ItemType;
}

export default async function getItemNameSuggestions({
  name,
  type,
}: ItemData): Promise<ApplicationCommandOptionChoiceData<string>[]> {
  const category: (Category | "SentinelWeapons")[] = [];

  // TODO: compute category to filter items by from type, if there is any at the moment
  // This depends on the lib exporting their types to be done properly, which is currently
  // pending (https://github.com/WFCD/warframe-items/issues/392)

  if (!type)
    category.push(
      "Arcanes",
      "Archwing",
      "Arch-Gun",
      "Arch-Melee",
      "Fish",
      "Gear",
      "Melee",
      "Misc",
      "Mods",
      "Node",
      "Pets",
      "Primary",
      "Relics",
      "Resources",
      "Secondary",
      "Sentinels",
      "SentinelWeapons",
      "Skins",
      "Warframes"
    );

  try {
    const items = new WFItems({ category });

    // ! Respect Discord's option limit, which is 25 at a time
    const MAX_RESULT_COUNT = 25;
    const results = [];

    const lowercaseItemName = name.toLowerCase();

    for (const item of items) {
      if (item.name.toLowerCase().includes(lowercaseItemName))
        results.push({ name: item.name, value: item.name });

      if (results.length === MAX_RESULT_COUNT) break;
    }

    return results;
  } catch (e) {
    console.error(
      "Failed to get item name autocomplete suggestions. Error:",
      e
    );
    return [];
  }
}
