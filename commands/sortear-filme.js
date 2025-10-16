import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { query } from "../data/db.js";

export default {
    data: new SlashCommandBuilder()
        .setName("sortear")
        .setDescription("Sorteia um filme aleatoriamente"),
    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            let filmeNaoConfirmado = true;
            const sortearFilmeQuery = `
                SELECT filme_sugerido_id, nome_filme, discord_user_id FROM filmes_sugeridos ORDER BY RANDOM() LIMIT 1;
            `;

            do {
                const { rows } = await query(sortearFilmeQuery);

                if (rows.length === 0) {
                    await interaction.editReply("Método finalizado, formatando retorno...");

                    const embed = new EmbedBuilder().setTitle("Ih, fudeu ❓😰")
                        .setDescription("Não foi encontrado nenhum filme para sorteio")
                        .setColor("Red");

                    await interaction.followUp({ embeds: [embed] });
                    await interaction.deleteReply();
                    return;
                } else {
                    await interaction.editReply("Método finalizado, formatando retorno...");

                    const filme = rows[0];

                    const botaoConfirmar = new ButtonBuilder().setCustomId("confirmar").setLabel("Vai ser esse filme 👍🏾😎").setStyle(ButtonStyle.Success);
                    const botaoSortearNovamente = new ButtonBuilder().setCustomId("sortearNovamente").setLabel("Esse não 👎🏾🤮").setStyle(ButtonStyle.Secondary);
                    const actionRow = new ActionRowBuilder().addComponents(botaoConfirmar, botaoSortearNovamente);

                    const response = await interaction.editReply({
                        content: "Confirmar filme?",
                        components: [actionRow]
                    });

                    const resultado = await new Promise((resolve) => {
                        const collector = response.createMessageComponentCollector({
                            filter: (i) => i.user.id === interaction.user.id,
                            time: 60_000
                        });

                        collector.on("collect", async (i) => {
                            if (i.customId === "confirmar") {
                                const embed = new EmbedBuilder()
                                    .setTitle("Sorteio pau na sua cara haha 🫵🏾😂")
                                    .setDescription(`${filme.filme_sugerido_id}. ${filme.nome_filme}\nSugerido pelo(a) Bobo(a) 👉🏾 <@${filme.discord_user_id}> 👌🏾`)
                                    .setColor("Random");

                                await i.update({ content: "Filme confirmado!", components: [], embeds: [embed] });
                                filmeNaoConfirmado = false;
                                collector.stop("confirmado");
                            } else if (i.customId === "sortearNovamente") {
                                await i.update({ content: "Beleza, sorteando outro filme...", components: [] });
                                collector.stop("sortear_novamente");
                            }
                        });

                        collector.on("end", (_, reason) => {
                            resolve(reason);
                        });
                    });

                    if (resultado === "confirmado") {
                        filmeNaoConfirmado = false;
                    } else if (resultado === "time") {
                        await interaction.editReply({
                            content: "⏰ Tempo esgotado. Tente novamente.",
                            components: [],
                            embeds: []
                        });
                        continuarSorteando = false;
                    }
                }
            } while (filmeNaoConfirmado);
        } catch (error) {
            console.error("Erro ao sortear filme:", error);
            await interaction.reply("Ocorreu um erro ao sortear um filme");
        }
    }
};
