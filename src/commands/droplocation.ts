import WarframeDrops from "../core/api/WarframeDrops";
import createCommand from "../core/create-command";
import DropAcquisitionType from "../core/models/DropAcquisitionType";
import getItemNameSuggestions from "../shared/autocomplete/item-name";

interface DropTypeConfig {
  acquisitionType: DropAcquisitionType;
  label: string;
}

const DISCORD_MESSAGE_LENGTH_LIMIT = 2000;

const WorldState = createCommand({
  configureBuilder(builder) {
    builder
      .setName("droplocation")
      .setDescription("Get information about the Warframe world's state")
      .addStringOption((option) =>
        option
          .setName("item")
          .setDescription("The item you're looking for")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption((option) =>
        option
          .setName("filters")
          .setDescription(
            "Comma-separated filters " +
              `("enemy", "planetNode", "sortie", "objective", "bounty" and/or "relic")`
          )
      );
  },
  async execute(interaction) {
    const item = interaction.options.getString("item");

    // TODO: implement filtering drop locations by drop acquisition type
    const filters = interaction.options.getString("filters");

    // Parse comma-separated filters and removes whitespaces if there are any
    let parsedFilters: string[] | null = null;

    if (filters) {
      parsedFilters = filters
        .split(",")
        .map((filter) => filter.replace(/\s+/g, ""));

      const filterChoices = [
        "enemy",
        "planetNode",
        "sortie",
        "bounty",
        "relic",
        "objective",
      ];

      for (const parsedFilter of parsedFilters) {
        if (!filterChoices.includes(parsedFilter)) {
          await interaction.reply(
            `_${parsedFilter}_ doesn't seem to be a valid filter. Are you sure that's what you meant?`
          );
          return;
        }
      }
    }

    try {
      const drops = await WarframeDrops.restrictTo(
        parsedFilters as DropAcquisitionType[] | null
      ).getItemDropLocation(item);

      if (Object.keys(drops).length === 0) {
        let message = `_${item}_ doesn't exist in the drop data`;

        if (parsedFilters)
          message += " for the specified filters";
        
        message += ".";

        await interaction.reply(message);
        return;
      }

      await interaction.reply(`Here's some drop data for _${item}_:`);

      const dropConfigs: DropTypeConfig[] = [
        {
          acquisitionType: "enemy",
          label: "shooting down enemies",
        },
        {
          acquisitionType: "planetNode",
          label: "completing missions",
        },
        {
          acquisitionType: "sortie",
          label: "completing sorties",
        },
        {
          acquisitionType: "bounty",
          label: "completing bounties",
        },
        {
          acquisitionType: "relic",
          label: "opening relics",
        },
        {
          acquisitionType: "objective",
          label: "through objectives",
        },
      ];

      for (const config of dropConfigs) {
        const filteredDrops = drops[config.acquisitionType] || {};

        if (Object.keys(filteredDrops).length === 0) continue;

        let message = `You can get it by ${config.label}:\n\n`;

        for (const [dropName, dropsByChance] of Object.entries(filteredDrops)) {
          message += `**${dropName}**\n`;

          for (const [dropChanceStr, dropsByNode] of Object.entries(
            dropsByChance
          )) {
            message += `_${dropChanceStr}%_:\n`;

            for (const [dropNodeName, descriptions] of Object.entries(
              dropsByNode
            )) {
              message += `- ${dropNodeName}\n`;
              message += descriptions.map((str) => `-- ${str}`).join("\n");
              message += "\n";
            }
          }
        }

        await interaction.followUp(message);
      }
    } catch (err) {
      if (err.fromAPI)
        await interaction.reply(`Trouble, Operator! ${err.message}`);
      else {
        console.error(
          "Unexpected error when searching for drop location. Error:",
          err
        );
        await interaction.reply("I've bEen cOrrUptEd, OperAtor!!1");
      }
    }
  },
  async autocomplete(interaction) {
    const focusedAutocompleteOption = interaction.options.getFocused(true);

    if (focusedAutocompleteOption.name === "item") {
      const suggestions = await getItemNameSuggestions({
        name: focusedAutocompleteOption.value,
      });

      await interaction.respond(suggestions);
    }
  },
});

export default WorldState;
