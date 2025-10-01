import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { REST, Routes } from "discord.js";

dotenv.config();

const commands = [];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const foldersPath = path.join(__dirname, "commands");

try {
	const commandFolders = fs.readdirSync(foldersPath);

	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = await import(pathToFileURL(filePath).href);

			if ('data' in command && 'execute' in command) {
				commands.push(command.data.toJSON());
			} else {
				console.log(`[WARNING] O comando em ${filePath} está faltando as propriedades "data" ou "execute".`);
			}
		}
	}
} catch (error) {
	console.error("Erro ao ler o diretório 'commands':", error);
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();
