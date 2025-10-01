import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName("server")
	.setDescription("Fornece informações do servidor");

export async function execute(interaction) {
	await interaction.reply(`Este servidor é o(a) ${interaction.guild.name} e tem ${interaction.guild.memberCount} membros`);
}
