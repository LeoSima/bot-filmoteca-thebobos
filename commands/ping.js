import { SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Devolve com pong"),
    async execute(interaction) {
        await interaction.reply("Pong");
    }
};
