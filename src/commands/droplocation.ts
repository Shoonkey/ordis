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
          .setName("filter")
          .setDescription("Where to look for the item in the drop data")
          // ! This must match DropAcqusitionType
          .addChoices(
            { name: "Enemies", value: "enemy" },
            { name: "Planet nodes", value: "planetNode" },
            { name: "Sortie", value: "sortie" },
            { name: "Bounties", value: "bounty" },
            { name: "Relics", value: "relic" },
            { name: "Other", value: "objective" }
          )
      );
  },
  async execute(interaction) {
    const item = interaction.options.getString("item");

    // TODO: implement filtering drop locations by drop acquisition type
    const filter = interaction.options.getString("filter");

    try {
      const drops = await WarframeDrops.getItemDropLocation(item);

      if (Object.keys(drops).length === 0) {
        await interaction.reply(
          `Item not found. Either _${item}_ doesn't exist or I don't know where to find it yet. ` +
            "Sorry, Operator."
        );
        return;
      }

      let message = `Here's some drop data for _${item}_, `;
      message += "by planet and drop chance:\n\n";

      const dropConfigs: DropTypeConfig[] = [
        {
          acquisitionType: "enemy",
          label: "Shooting down enemies",
        },
        {
          acquisitionType: "planetNode",
          label: "Completing missions",
        },
        {
          acquisitionType: "sortie",
          label: "Completing sorties",
        },
        {
          acquisitionType: "bounty",
          label: "Completing bounties",
        },
        {
          acquisitionType: "relic",
          label: "Opening relics",
        },
        {
          acquisitionType: "objective",
          label: "Other ways",
        },
      ];

      dropConfigs.forEach((config) => {
        const filteredDrops = drops[config.acquisitionType] || {};

        if (Object.keys(filteredDrops).length === 0) return;

        message += `${config.label}:\n\n`;

        Object.entries(filteredDrops).forEach(
          ([dropName, dropsByChance], index, arr) => {
            message += `**${dropName}**\n`;
            Object.entries(dropsByChance).forEach(
              ([dropChanceStr, dropsByNode]) => {
                message += `_${dropChanceStr}%_:\n`;
                Object.entries(dropsByNode).forEach(
                  ([dropNodeName, descriptions]) => {
                    message += `- ${dropNodeName}\n`;
                    message += descriptions
                      .map((str) => `-- ${str}`)
                      .join("\n");
                    message += "\n";
                  }
                );
              }
            );

            if (index !== arr.length - 1) message += "\n";
          }
        );
      });

      if (message.length > DISCORD_MESSAGE_LENGTH_LIMIT)
        await interaction.reply(
          "Woah, the data about this drop is too much for Discord. Consider adding a filter"
        );

      await interaction.reply(message);
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
