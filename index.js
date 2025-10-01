import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from "discord.js";

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
	const foldersPath = path.join(__dirname, 'commands');
	const commandFolders = fs.readdirSync(foldersPath);

	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = await import(pathToFileURL(filePath).href);

			if ('data' in command && 'execute' in command) {
				console.log(command.data.name);
				console.log(command);
				client.commands.set(command.data.name, command);
			} else {
				console.log(`[WARNING] O comando em ${filePath} está faltando as propriedades "data" ou "execute".`);
			}
		}
	}
} catch (error) {
	console.error("Erro ao ler o diretório 'commands':", error);
}

try {
	const eventsPath = path.join(__dirname, "events");
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = await import (pathToFileURL(filePath).href);
		const eventHandler = event.default;

		if (eventHandler.once) {
			client.once(eventHandler.name, (...args) => eventHandler.execute(...args));
		} else {
			client.on(eventHandler.name, (...args) => eventHandler.execute(...args));
		}
	}
} catch (error) {
	console.error("Erro ao ler o diretório 'events':", error);
}

client.login(process.env.DISCORD_TOKEN);
