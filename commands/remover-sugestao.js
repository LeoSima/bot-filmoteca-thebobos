import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { query } from "../data/db.js";

export default {
    data: new SlashCommandBuilder()
        .setName("remover-sugestao")
        .setDescription("Remove um filme sugerido")
        .addIntegerOption(idFilme =>
            idFilme.setName("id")
                .setDescription("ID do filme que deseja remover")
                .setRequired(true)
        ),
    async execute(interaction) {
        const id = interaction.options.getInteger("id");

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const deletarFilmeQuery = `
                DELETE FROM filmes_sugeridos WHERE filme_sugerido_id = $1 RETURNING *;
            `;
            const parametrosQuery = [id];
            const { rows } = await query(deletarFilmeQuery, parametrosQuery);

            const embed = new EmbedBuilder().setColor("Red");
            if (rows.length === 0) {
                embed.setTitle("Perdoa o pai 😭👎🏾")
                    .setDescription("Não foi encontrado nenhum filme com os parâmetros informados");
            } else {
                const embedConfirmacao = new EmbedBuilder().setTitle("Tem certeza? 🤨🔥")
                    .setDescription(`Quer deletar o filme ${rows[0].nome_filme} (ID ${rows[0].filme_sugerido_id})`)
                    .setColor("Random");

                const botaoConfirmar = new ButtonBuilder().setCustomId("confirmar").setLabel("Apaga, apaga! 😈🤘🏾").setStyle(ButtonStyle.Success);
                const botaoSortearNovamente = new ButtonBuilder().setCustomId("sortearNovamente").setLabel("Esse não 👎🏾🤮").setStyle(ButtonStyle.Secondary);
                const actionRow = 

                embed.setTitle("It's over 🗑️💀")
                    .setDescription(`Filme "${rows[0].nome_filme}" (ID ${rows[0].filme_sugerido_id}) removido da lista`);
            }

            await interaction.editReply("Método finalizado, formatando retorno...")
            await interaction.followUp({ embeds: [embed] });
            await interaction.deleteReply();
        } catch (error) {
            console.error("Erro ao tentar remover a sugestão:", error);
            await interaction.reply("Ocorreu um erro ao tentar remover a sugestão de filme");
        }
    }
};
