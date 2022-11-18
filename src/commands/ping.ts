import { Client, CommandInteraction, SlashCommandBuilder } from "discord.js";

import Command from "../core/models/Command";

const Ping: Command = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction: CommandInteraction) {
		await interaction.reply('PONG PORRA!');
	},
};

 export default Ping;
