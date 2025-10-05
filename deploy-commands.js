import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { REST, Routes } from "discord.js";

dotenv.config();

const comandos = [];

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
			comandos.push(comando.data.toJSON());
		} else {
			console.log(`[WARNING] O comando em ${pathComando} não possui as propriedades "data" e/ou "execute"`);
		}
	}
} catch (error) {
	console.error("Erro ao ler o diretório 'commands':", error);
}

if (comandos.length === 0) {
	console.log("[WARNING] Nenhum comando válido encontrado para deploy, encerrando processo...");
	process.exit(0);
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);
(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: comandos },
		);
	} catch (error) {
		console.error(error);
	}
})();
