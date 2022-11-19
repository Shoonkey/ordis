import path from 'path';
import fs from 'fs';
import { REST, Routes } from 'discord.js';

export default async function deployCommands() {
	const commandsPath = path.join(__dirname, "../commands");
	const commands = [];

	// Grab all the command files from the commands directory
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter(file => file.endsWith('.js') && file !== 'index.js');

	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const command = require(`${commandsPath}/${file}`).default;
		commands.push(command.data.toJSON());
	}

	// Construct and prepare an instance of the REST module
	const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

	try {
		console.log(`Refreshing ${commands.length} application (/) commands...`);

		// Refresh all commands
		await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: commands },
		);

		console.log("Done!");
	} catch (error) {
		console.error(error);
	}
};