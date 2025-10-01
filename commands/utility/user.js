import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName("user")
	.setDescription("Fornece informações sobre o usuário");

export async function execute(interaction) {
	await interaction.reply(
		`Esse comando foi executado por ${interaction.user.username}, que entrou no servidor em ${interaction.member.joinedAt}`
	);
}
