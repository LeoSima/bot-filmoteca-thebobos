import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { REST, Routes } from "discord.js";

dotenv.config();

const comandos = [];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pathDiretorios = path.join(__dirname, "commands");

try {
	const diretoriosComandos = fs.readdirSync(pathDiretorios);

	for (const diretorio of diretoriosComandos) {
		const pathComandos = path.join(pathDiretorios, diretorio);
		const arquivosComandos = fs.readdirSync(pathComandos).filter(a => a.endsWith(".js"));
		for (const arquivo of arquivosComandos) {
			const pathArquivo = path.join(pathComandos, arquivo);
			const comando = await import(pathToFileURL(pathArquivo).href);

			if ("data" in comando && "execute" in comando) {
				comandos.push(comando.data.toJSON());
			} else {
				console.log(`[WARNING] O comando em ${pathArquivo} não possui as propriedades "data" e/ou "execute"`);
			}
		}
	}
} catch (error) {
	console.error("Erro ao ler o diretório 'commands':", error);
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
