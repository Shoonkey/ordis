import { ApplicationCommandType, Client, CommandInteraction } from "discord.js";
import Wishlist from "../shared/wishlist";
import { Command } from "../core/Command";

const wishlist: Wishlist[] = [];

const Wish: Command = {
  name: "wish",
  description: "Modifies or list the user's wishlist",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {

    console.log(interaction);

    await interaction.followUp({
      ephemeral: true,
      content: "Lista de itens: ",
    });
  },
};

export default Wish;
