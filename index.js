import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Client, Collection, GatewayIntentBits } from "discord.js";

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
	const diretorioComandos = path.join(__dirname, "commands");
	const arquivosComandos = fs.readdirSync(diretorioComandos).filter(a => a.endsWith(".js"));

	for (const arquivo of arquivosComandos) {
		const pathComando = path.join(diretorioComandos, arquivo);
		const moduloComando = await import(pathToFileURL(pathComando).href);
		const comando = moduloComando.default;

		if ("data" in comando && "execute" in comando) {
			client.commands.set(comando.data.name, comando);
		} else {
			console.log(`[WARNING] O comando em ${pathComando} não possui as propriedades "data" e/ou "execute"`);
		}
	}
} catch (error) {
	console.error("Erro ao ler o diretório 'commands':", error);
}

try {
	const diretorioEventos = path.join(__dirname, "events");
	const arquivosEventos = fs.readdirSync(diretorioEventos).filter(a => a.endsWith(".js"));

	for (const arquivo of arquivosEventos) {
		const pathArquivo = path.join(diretorioEventos, arquivo);
		const evento = await import (pathToFileURL(pathArquivo).href);
		const eventoHandler = evento.default;

		if (eventoHandler.once) {
			client.once(eventoHandler.name, (...args) => eventoHandler.execute(...args));
		} else {
			client.on(eventoHandler.name, (...args) => eventoHandler.execute(...args));
		}
	}
} catch (error) {
	console.error("Erro ao ler o diretório 'events':", error);
}

client.login(process.env.DISCORD_TOKEN);
