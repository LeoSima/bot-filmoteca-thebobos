import { Events } from "discord.js";

export default {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Tudo pronto! Logado como ${client.user.tag}`);
	},
};
