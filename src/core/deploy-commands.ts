import path from 'path';
import fs from 'fs';
import { REST, Routes } from 'discord.js';
import loadCommands from './load-commands';

export default async function deployCommands() {

	const commandData = loadCommands().map(command => command.config.toJSON());

	// Construct and prepare an instance of the REST module
	const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

	try {
		console.log(`Loading ${commandData.length} application slash command(s)...`);

		// Refresh all commands
		await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: commandData },
		);

		console.log("Done!");
	} catch (error) {
		console.error(error);
	}
};