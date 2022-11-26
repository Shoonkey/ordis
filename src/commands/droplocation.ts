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

      await interaction.reply(`Here's some drop data for _${item}_:`);

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

      for (const config of dropConfigs) {
        const filteredDrops = drops[config.acquisitionType] || {};

        if (Object.keys(filteredDrops).length === 0)
          continue;

        let message = `${config.label}:\n\n`;

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
