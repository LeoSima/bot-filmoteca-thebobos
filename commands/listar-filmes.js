import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { query } from "../data/db.js";

export default {
    data: new SlashCommandBuilder()
        .setName("listar")
        .setDescription("Traz a lista completa de filmes (por enquanto, da lista de filmes sugeridos)"),
    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const listarFilmesQuery = `
                SELECT filme_sugerido_id, nome_filme, discord_user_id FROM filmes_sugeridos ORDER BY data_sugestao ASC;
            `;
            const { rows } =  await query(listarFilmesQuery);

            const embed = new EmbedBuilder();
            if (rows.length === 0) {
                embed.setTitle("Perdoa o pai 😭👎🏾")
                    .setDescription("Não foi encontrado nenhum filme com os parâmetros informados")
                    .setColor("Red");
            } else if (rows.length < 26) { // O Embed só pode ter até 25 fields
                embed.setTitle("Vai tomando 🥵👍🏾").setColor("Random");

                rows.forEach(registro => {
                    embed.addFields({
                        name: `${registro.filme_sugerido_id}. ${registro.nome_filme}`,
                        value: `Sugerido pelo(a) Bobo(a) 👉🏾 <@${registro.discord_user_id}> 👌🏾`
                    });
                });
            } else {
                embed.setTitle("Pode não man 😡❌")
                    .setDescription("O retorno é grande demais e a solução ainda não foi implementada")
                    .setColor("Red");
            }

            await interaction.editReply("Busca finalizada, formatando retorno...");
            await interaction.followUp({ embeds: [embed] });
            await interaction.deleteReply();
        } catch (error) {
            console.error("Erro ao buscar filmes:", error);
            await interaction.editReply("Occoreu um erro ao buscar a lista de filmes");
        }
    }
};
