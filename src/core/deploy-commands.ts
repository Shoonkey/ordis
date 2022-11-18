import { REST, Routes } from 'discord.js';
import fs from 'fs';

// and deploy your commands!
const deployCommands = async () => {
	const commandsPath = "./src/commands";
	const commands = [];

	// Grab all the command files from the commands directory you created earlier
	const commandFiles = fs
	.readdirSync(commandsPath)
	.filter(file => file.endsWith('.js') && file !== 'index.js');

	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		console.log(commandsPath + '/' + file)
		const command = require(`${commandsPath}/${file}`).default;
		commands.push(command.data.toJSON());
	}

	// Construct and prepare an instance of the REST module
	const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
};

export default deployCommands;