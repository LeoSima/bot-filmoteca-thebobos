import fs from "fs";
import { AttachmentBuilder, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
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
            if (rows.length <= 25) { // O Embed só pode ter até 25 fields
                await interaction.editReply("Busca finalizada, formatando retorno...");

                if (rows.length === 0) {
                    embed.setTitle("Perdoa o pai 😭👎🏾")
                        .setDescription("Não foi encontrado nenhum filme com os parâmetros informados")
                        .setColor("Red");
                } else {
                    embed.setTitle("Vai tomando 🥵👍🏾").setColor("Random");

                    rows.forEach(registro => {
                        embed.addFields({
                            name: `${registro.filme_sugerido_id}. ${registro.nome_filme}`,
                            value: `Sugerido pelo(a) Bobo(a) 👉🏾 <@${registro.discord_user_id}> 👌🏾`
                        });
                    });
                }

                await interaction.followUp({ embeds: [embed] });
                await interaction.deleteReply();
            } else {
                await interaction.editReply("Lista de filmes muito grande, gerando arquivo...");

                const caminhoArquivoTemporario = "./temp-listar-filmes/filmes.txt";
                let conteudoArquivo;
                rows.forEach(registro => {
                    registro += `${registro.filme_sugerido_id}. ${registro.nome_filme}\n`
                });

                fs.writeFileSync(caminhoArquivoTemporario, conteudoArquivo);
                const arquivo = new AttachmentBuilder(caminhoArquivoTemporario);

                embed.setTitle("Pode não man 😡❌")
                    .setDescription("O retorno é grande demais e a solução ainda não foi implementada")
                    .setColor("Red");

                await interaction.followUp({
                    embeds: [embed],
                    files: [arquivo]
                });
                await interaction.deleteReply();

                fs.unlinkSync(caminhoArquivoTemporario);
            }
        } catch (error) {
            console.error("Erro ao buscar filmes:", error);
            await interaction.editReply("Occoreu um erro ao buscar a lista de filmes");
        }
    }
};
