import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { query } from "../data/db.js";

export default {
    data: new SlashCommandBuilder()
        .setName("sortear")
        .setDescription("Sorteia um filme aleatoriamente"),
    async execute(interaction) {
        try {
            const sortearFilmeQuery = `
                SELECT filme_sugerido_id, nome_filme, discord_user_id FROM filmes_sugeridos ORDER BY RANDOM() LIMIT 1;
            `;
            const { rows } = await query(sortearFilmeQuery);

            const embed = new EmbedBuilder();
            if (rows.length === 0) {
                embed.setTitle("Ih, fudeu ❓😰")
                    .setDescription("Não foi encontrado nenhum filme para sorteio")
                    .setColor("Red");
            } else {
                const filme = rows[0];
                embed.setTitle("Sorteio pau na sua cara haha 🫵🏾😂!")
                    .setDescription(`${filme.filme_sugerido_id}. ${filme.nome_filme}\nSugerido pelo(a) Bobo(a) 👉🏾 <@${filme.discord_user_id}> 👌🏾`)
                    .setColor("Random");
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Erro ao sortear filme:", error);
            await interaction.reply("Ocorreu um erro ao sortear um filme");
        }
    }
};
