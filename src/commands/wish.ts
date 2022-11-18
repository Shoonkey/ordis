import { Client, CommandInteraction, SlashCommandBuilder } from "discord.js";

import Command from "../core/models/Command";
import Wishlist from "../shared/models/wishlist";

const wishlist: Wishlist[] = [];

const builder = new SlashCommandBuilder()
builder
  .setName('wish')
  .setDescription("Modifies or list the user's wishlist.")
  .addUserOption(option =>
    option
      .setName('type')
      .setDescription('Type of the item')
      .setRequired(true))
  .addStringOption(option =>
    option
      .setName('name')
      .setDescription('The item name')
      .setRequired(true));

const Wish: Command = {
  data: builder,
  async execute(interaction: CommandInteraction) {
    console.log(interaction);
  }
};

export default Wish;
