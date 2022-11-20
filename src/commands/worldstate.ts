import WarframeStatus from "../core/api/WarframeStatus";
import createCommand from "../core/create-command";

const WorldState = createCommand(
  builder => {
    builder
      .setName("worldstate")
      .setDescription("Get information about the Warframe world's state")
      .addStringOption(option =>
        option
          .setName("platform")
          .setDescription("The platform you're on or wanna know about")
          .setRequired(true)
          .addChoices(
            { name: "PC", value: "pc" },
            { name: "PlayStation 4", value: "ps4" },
            { name: "Xbox One", value: "xb1" },
            { name: "Switch", value: "swi" }
          )
      )
      .addStringOption(option => 
        option
          .setName("world")
          .setDescription("The world you want to know about")
          .setRequired(true)
          .addChoices(
            { name: "Cetus", value: "cetus" },
            { name: "Cambion Drift", value: "cambion" },
            { name: "Earth", value: "earth" }
          )
      )
  },
  async interaction => {

    const platform = interaction.options.get("platform").value as string;
    const world = interaction.options.get("world").value as string;

    const capitalize = (word: string) => word[0].toUpperCase() + word.substring(1);

    try {
      const response = await WarframeStatus.setPlatform(platform).getWorldState(world);
      let message = "";

      if (world === "cetus" || world === "earth") {
        const { isDay, timeLeft } = response.data;

        message += `It is currently _${isDay ? "day" : "night"}time_ in ${capitalize(world)} `;
        message += `${isDay ? ":sunny:" : ":crescent_moon:"}\n`;
        message += `It'll change in _${timeLeft}_`;
      } else if (world === "cambion") {
        const { active, timeLeft } = response.data;

        message += `The Cambion Drift is currently in the _${capitalize(active)}_ phase\n`;
        message += `It'll change in _${timeLeft}_`;
      }

      await interaction.reply(message);
    } catch (err) {
      if (err.fromAPI)
        await interaction.reply(`Trouble, Operator! ${err.message}`);
      else
        await interaction.reply("I've bEen cOrrUptEd, OperAtor!!1");
    }

  }
)

export default WorldState;