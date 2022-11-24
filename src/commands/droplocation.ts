import WarframeDrops from "../core/api/WarframeDrops";
import createCommand from "../core/create-command";
import Drop from "../core/models/Drop";

type DropMessageFormatter = (drop: Drop) => string;

interface DropTypeConfig {
  acquisitionType: Drop["acquirableThrough"];
  label: string;
  customMessageFormat?: DropMessageFormatter;
}

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
      );
  },
  async execute(interaction) {
    const item = interaction.options.getString("item");

    try {
      const drops = await WarframeDrops.getItemDropLocation(item);

      if (drops.length === 0) {
        await interaction.reply(
          `Item not found. Are you sure you meant "${item}"?`
        );
        return;
      }

      let message = `Here's some drop data for "${item}":\n\n`;

      const dropConfigs: DropTypeConfig[] = [
        {
          acquisitionType: "enemy",
          label: "Enemies",
          customMessageFormat(drop) {
            let message = `Shooting down ${drop.description}`;
            message += ` has a ${drop.dropChance}% of`;
            message += ` dropping ${drop.itemName}`;
            return message;
          }
        },
        {
          acquisitionType: "planetNode",
          label: "Planet nodes (missions)"
        },
        {
          acquisitionType: "sortie",
          label: "Sortie"
        },
        {
          acquisitionType: "objective",
          label: "Other",
        },
        {
          acquisitionType: "bounty",
          label: "Bounties",
        },
        {
          acquisitionType: "relic",
          label: "Opening relics",
        },
      ];

      dropConfigs.forEach(config => {
        const filteredDrops = drops.filter(
          (drop) => drop.acquirableThrough === config.acquisitionType
        );

        if (filteredDrops.length === 0) return;

        function formatDrop(drop) {
          if (config.customMessageFormat)
            return config.customMessageFormat(drop);
          
          let message = `Completing ${drop.description}`;
          message += ` has a ${drop.dropChance}% of`;
          message += ` dropping ${drop.itemName}`;
          return message;
        }

        message += filteredDrops.map(formatDrop);
      });
    } catch (err) {
      if (err.fromAPI)
        await interaction.reply(`Trouble, Operator! ${err.message}`);
      else await interaction.reply("I've bEen cOrrUptEd, OperAtor!!1");
    }
  },
});

export default WorldState;
