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

        const selectFilmeQuery = `
            SELECT filme_sugerido_id, nome_filme FROM filmes_sugeridos WHERE filme_sugerido_id = $1
        `;
        const parametrosSelectQuery = [id];
        let { rows } = await  query(selectFilmeQuery, parametrosSelectQuery);

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const embed = new EmbedBuilder().setColor("Red");
            if (rows.length === 0) {
                const embed = new EmbedBuilder().setTitle("Perdoa o pai 😭👎🏾")
                    .setDescription("Não foi encontrado nenhum filme com os parâmetros informados")
                    .setColor("Random");

                await interaction.editReply({
                    content: "",
                    embeds: [embed]
                });
            } else {
                const filmeParaDeletar = rows[0];
                const embedConfirmacao = new EmbedBuilder().setTitle("Tem certeza? 🤨🔥")
                    .setDescription(`Quer deletar o filme ${filmeParaDeletar.nome_filme} (ID ${filmeParaDeletar.filme_sugerido_id})`)
                    .setColor("Random");

                const botaoConfirmar = new ButtonBuilder().setCustomId("remover").setLabel("Apaga, apaga! 😈🤘🏾").setStyle(ButtonStyle.Danger);
                const botaoCancelarOperacao = new ButtonBuilder().setCustomId("cancelar").setLabel("Hmm, pensando bem deixe baixo 🤡🫸🏽").setStyle(ButtonStyle.Secondary);
                const actionRow = new ActionRowBuilder().addComponents(botaoConfirmar, botaoCancelarOperacao);

                const response = await interaction.editReply({
                    content: "",
                    embeds: [embedConfirmacao],
                    components: [actionRow]
                });
                const respostaUsuario = await handleRespostaUsuario(interaction, response);

                if (respostaUsuario === "remocaoConfirmada") {
                    const deletarFilmeQuery = `
                        DELETE FROM filmes_sugeridos WHERE filme_sugerido_id = $1 RETURNING *;
                    `;
                    const parametrosDeleteQuery = [id];
                    let { rows } = await query(deletarFilmeQuery, parametrosDeleteQuery);
                    const filmeDeletado = rows[0];

                    const embed = new EmbedBuilder().setTitle("It's over 🗑️💀")
                        .setDescription(`Filme "${filmeDeletado.nome_filme}" (ID ${filmeDeletado.filme_sugerido_id}) removido da lista`)
                        .setColor("DarkRed");

                    await interaction.editReply("Filme deletado, formatando retorno...")
                    await interaction.followUp({
                        content: "",
                        embeds: [embed],
                        components: [],
                    });
                    await interaction.deleteReply();
                } else if (respostaUsuario === "cancelarOperacao") {
                    const embed = new EmbedBuilder().setTitle("Peida não xerequinha 🤏🏽🥺")
                        .setDescription("O filme não foi deletado")
                        .setColor("Grey");

                    await interaction.editReply({
                        content: "",
                        embeds: [embed],
                        components: []
                    });
                } else if (respostaUsuario === "time") {
                    const embed = new EmbedBuilder().setTitle("Coé, cabô o tempo 🧐⏳")
                        .setDescription("O tempo para confirmar a operação acabou (o filme não foi deletado)...")
                        .setColor("Grey");

                    await interaction.editReply({
                        content: "",
                        embeds: [embed],
                        components: []
                    });
                }
            }
        } catch (error) {
            console.error("Erro ao tentar remover a sugestão:", error);
            await interaction.reply("Ocorreu um erro ao tentar remover a sugestão de filme");
        }
    }
};

async function handleRespostaUsuario(interaction, response) {
    return await new Promise((resolve) => {
        const collector = response.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 60_000
        });

        collector.on("collect", async(i) => {
            if (i.customId === "remover") {
                await i.update({
                    content: "Removendo filme...",
                    embeds: [],
                    components: []
                });
                collector.stop("remocaoConfirmada");
            } else if (i.customId === "cancelar") {
                await i.update({
                    content: "Cancelando operação...",
                    embeds: [],
                    components: []
                });
                collector.stop("cancelarOperacao");
            }
        });

        collector.on("end", (_, reason) => {
            resolve(reason);
        });
    });
}
