import fs from "fs";
import path from "path";

import Command from "./models/Command";

export default function loadCommands(): Command[] {
  const commandsPath = path.join(__dirname, "../commands");
  const commands = [];

	// Grab all the command files from the commands directory
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter(file => file.endsWith('.js') && file !== 'index.js');

	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const command = require(`${commandsPath}/${file}`).default;
		commands.push(command);
	}

  return commands;
}