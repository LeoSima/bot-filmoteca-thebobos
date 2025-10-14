import fs from "fs";
import path from "path";
import { AttachmentBuilder, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { query } from "../data/db.js";

export default {
    data: new SlashCommandBuilder()
        .setName("buscar")
        .setDescription("Busca filmes com base nos parâmetros passados para busca")
        .addIntegerOption(idFilme => 
            idFilme.setName("id")
                .setDescription("Id do filme")
                .setRequired(false)
        )
        .addStringOption(nomeFilme =>
            nomeFilme.setName("nome")
                .setDescription("Nome do filme")
                .setRequired(false)
        )
        .addStringOption(usuario =>
            usuario.setName("usuario")
                .setDescription("Nome de usuário do Discord de quem inseriu o filme")
                .setRequired(false)
        ),
    async execute(interaction) {
        const id = interaction.options.getInteger("id");
        const nomeFilme = interaction.options.getString("nome");
        const username = interaction.options.getString("usuario");

        if (!id && !nomeFilme && !username) {
            const embed = new EmbedBuilder()
                .setTitle("Ê burrão 🫵🏾🫏")
                .setDescription("Tem que passar pelo menos um parâmetro (ID do filme, nome do filme e/ou username de quem sugeriu)")
                .setColor("Red");

            await interaction.reply({ embeds: [embed] });
        }

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const filtros = [];
            const valores = [];

            if (id) {
                valores.push(id);
                filtros.push(`filme_sugerido_id = $${valores.length}`);
            }

            if (nomeFilme) {
                valores.push(`%${nomeFilme}%`);
                filtros.push(`nome_filme ILIKE $${valores.length}`);
            }

            if (username) {
                valores.push(username);
                filtros.push(`discord_user_username ILIKE $${valores.length}`);
            }

            const buscarFilmesQuery = `
                SELECT 
                    filme_sugerido_id, nome_filme, discord_user_id 
                FROM 
                    filmes_sugeridos 
                WHERE 
                    ${filtros.join(" AND ")}
                ORDER BY 
                    data_sugestao ASC;
            `;
            const { rows } = await query(buscarFilmesQuery, valores);

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

                const pastaTemporaria = "./data/temp-buscar-filmes";
                fs.mkdirSync(pastaTemporaria);

                const caminhoArquivoTemporario = path.join(pastaTemporaria, "filmes.txt");

                let conteudoArquivo = "";
                rows.forEach(registro => {
                    conteudoArquivo += `${registro.filme_sugerido_id}. ${registro.nome_filme}\n`
                });

                fs.writeFileSync(caminhoArquivoTemporario, conteudoArquivo);
                const arquivo = new AttachmentBuilder(caminhoArquivoTemporario);

                embed.setTitle("Taporra é muito filme mané kkkj 🤓📜")
                    .setDescription("Filmes encontrados com sucesso. Como não cabe em mensagem do Discord, foi convertido em .txt")
                    .setColor("Random");

                await interaction.followUp({
                    embeds: [embed],
                    files: [arquivo]
                });
                await interaction.deleteReply();

                fs.unlinkSync(caminhoArquivoTemporario);
                fs.rmdirSync(pastaTemporaria);
            }
        } catch (error) {
            console.error("Erro ao buscar filmes:", error);
            await interaction.editReply("Occoreu um erro ao buscar os filmes");
        }
    }
};
