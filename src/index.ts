import * as dotenv from "dotenv";
import { Client } from "discord.js";

import processMessage from "./processMessage";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const client = new Client();

client.once("ready", () => console.log("Connected."));

client.on("message", (message) => processMessage(message));

client.login(process.env.TOKEN);
