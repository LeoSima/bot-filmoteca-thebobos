import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { query } from "../data/db.js";

export default {
    data: new SlashCommandBuilder()
        .setName("listar")
        .setDescription("Traz a lista completa de filmes (por enquanto, da lista de filmes sugeridos)"),
    async execute(interaction) {
        try {
            const listarFilmesQuery = `
                SELECT nome_filme, discord_user_username FROM filmes_sugeridos ORDER BY data_sugestao ASC;
            `;
            const { rows } =  await query(listarFilmesQuery);

            if (rows.length === 0) {
                return interaction.reply("Nenhum filme encontrado");
            }

            const embed = new EmbedBuilder()
                .setTitle("Filmes")
                .setColor(0x00AE86);

            rows.forEach(registro => {
                embed.addFields({
                    name: `Sugerido por: ${registro.discord_user_username}`,
                    value: `Nome do filme: ${registro.nome_filme}`
                });
            });
        
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Erro ao buscar filmes:", error);
            await interaction.reply("Occoreu um erro ao buscar a lista de filmes");
        }
    }
};
