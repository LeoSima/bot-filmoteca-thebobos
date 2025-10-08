import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { query } from "../data/db.js";

export default {
    data: new SlashCommandBuilder()
        .setName("sortear")
        .setDescription("Sorteia um filme aleatoriamente"),
    async execute(interaction) {
        try {
            const sortearFilmeQuery = `
                SELECT nome_filme FROM filmes_sugeridos ORDER BY RANDOM() LIMIT 1;
            `;
            const { rows } = await query(sortearFilmeQuery);

            if (rows.length === 0) {
                return interaction.reply("Erro ao sortear filme: nenhum filme encontrado");
            }

            const embed = new EmbedBuilder()
                .setTitle("Filme Sorteado")
                .setDescription(rows[0].nome_filme)
                .setColor(0x00AE86);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Erro ao sortear filme:", error);
            await interaction.reply("Ocorreu um erro ao sortear um filme");
        }
    }
};
