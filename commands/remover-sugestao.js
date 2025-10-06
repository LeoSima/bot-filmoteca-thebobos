import { SlashCommandBuilder } from "discord.js";
import { query } from "../data/db.js";

export default {
    data: new SlashCommandBuilder()
        .setName("remover-sugestao")
        .setDescription("Remove um filme sugerido")
        .addStringOption(nomeFilme =>
            nomeFilme.setName("nome")
                .setDescription("Nome do filme que deseja remover")
                .setRequired(false)
        )
        .addIntegerOption(idFilme =>
            idFilme.setName("id")
                .setDescription("ID do filme que deseja remover")
                .setRequired(false)
        ),
    async execute(interaction) {
        const nomeFilme = interaction.options.getString("nome");
        const id = interaction.options.getInteger("id");

        if (!nomeFilme && !id) {
            await interaction.reply("É necessário informar ao menos um parâmetro para remoção");
        } else if (nomeFilme && id) {
            await interaction.reply("Informe apenas um parâmetro por vez para a remoção");
        }

        try {
            let filtro;
            if (nomeFilme) {
                filtro = `nome_filme ILIKE ${nomeFilme}`;
            } else if (id) {
                filtro = `filme_sugerido_id = ${id}`;
            }

            const deletarFilmeQuery = `
                DELETE FROM filmes_sugeridos WHERE ${filtro} RETURNING *;
            `;
            const { rows } = await query(deletarFilmeQuery);

            if (rows.length === 0) {
                return await interaction.replay("Erro ao remover sugestão: filme não encontrado");
            }

            await interaction.reply(`Filme "${rows[0].nome_filme}" (ID ${rows[0].filme_sugerido_id}) removido com sucesso`);
        } catch (error) {
            console.error("Erro ao tentar remover a sugestão:", error);
            await interaction.reply("Ocorreu um erro ao tentar remover a sugestão de filme");
        }
    }
};
