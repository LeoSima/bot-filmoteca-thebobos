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
                SELECT 
                    fs.filme_sugerido_id AS filmeId,
                    fs.nome_filme AS nomeFilme,
                    fs.discord_user_id AS discordUserId
                FROM 
                    filmes_sugeridos AS fs
                ORDER BY 
                    RANDOM() 
                LIMIT 1;
            `;

            do {
                const { rows } = await query(sortearFilmeQuery);

                if (rows.length === 0) {
                    await interaction.editReply("Método finalizado, formatando retorno...");

                    const embed = criarEmbedErro();

                    await interaction.followUp({ embeds: [embed] });
                    await interaction.deleteReply();
                    return;
                } else {
                    await interaction.editReply("Método finalizado, formatando retorno...");

                    const filme = rows[0];
                    const actionRow = criarActionRow();
                    const embed = criarEmbedConfirmacaoSorteio(filme.nomeFilme);

                    const response = await interaction.editReply({
                        embeds: [embed],
                        components: [actionRow]
                    });

                    const resultado = await handleRespostaUsuario(interaction, response);

                    if (resultado === "confirmado") {
                        const embed = criarEmbedFilmeEscolhido(filme);

                        await interaction.followUp({ embeds: [embed] });
                        await interaction.deleteReply();

                        filmeNaoConfirmado = false;
                    } else if (resultado === "time") {
                        await interaction.editReply("Tempo esgotado, formatando retorno...");

                        const embed = criarEmbedTempoEsgotado();

                        await interaction.followUp({ embeds: [embed] });
                        await interaction.deleteReply();

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

function criarEmbedErro() {
    return new EmbedBuilder().setTitle("Ih, fudeu ❓😰")
        .setDescription("Não foi encontrado nenhum filme para sorteio")
        .setColor("Red");
}

function criarEmbedConfirmacaoSorteio(nomeFilme) {
    return new EmbedBuilder().setTitle("Sorteia legal dog 🫡🎲")
        .setDescription(`Filmim hoje vai ser '${nomeFilme}'?`)
        .setColor("Random");
}

function criarEmbedTempoEsgotado() {
    return new EmbedBuilder().setTitle("Coé, cabô o tempo 🧐⏳")
        .setDescription("O tempo para confirmar o temp acabou...")
        .setColor("Red");
}

function criarEmbedFilmeEscolhido(filme) {
    return new EmbedBuilder().setTitle("Sorteio pau na sua cara haha 🫵🏾😂")
        .setDescription(`${filme.filmeId}. ${filme.nomeFilme}\nSugerido pelo(a) Bobo(a) 👉🏾 <@${filme.discordUserId}> 👌🏾`)
        .setColor("Random");
}

function criarActionRow() {
    const botaoConfirmar = new ButtonBuilder().setCustomId("confirmar").setLabel("Vai ser esse filme 👍🏾😎").setStyle(ButtonStyle.Success);
    const botaoSortearNovamente = new ButtonBuilder().setCustomId("sortearNovamente").setLabel("Esse não 👎🏾🤮").setStyle(ButtonStyle.Secondary);

    return new ActionRowBuilder().addComponents(botaoConfirmar, botaoSortearNovamente);
}

async function handleRespostaUsuario(interaction, response) {
    return await new Promise((resolve) => {
        const collector = response.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 60_000
        });

        collector.on("collect", async (i) => {
            if (i.customId === "confirmar") {
                await i.update({ content: "Filme confirmado! Formatando retorno..." });
                collector.stop("confirmado");
            } else if (i.customId === "sortearNovamente") {
                await i.update({ content: "Beleza, sorteando outro filme..." });
                collector.stop("sortear_novamente");
            }
        });

        collector.on("end", (_, reason) => {
            resolve(reason);
        });
    });
}
