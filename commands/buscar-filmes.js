import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { query } from "../data/db.js";

export default {
    data: new SlashCommandBuilder()
        .setName("buscar")
        .setDescription("Busca filmes com base nos parâmetros passados para busca")
        .addStringOption(nomeFilme =>
            nomeFilme.setName("nome")
                .setDescription("Nome do filme que procura")
                .setRequired(false)
        )
        .addStringOption(usuario =>
            usuario.setName("usuario")
                .setDescription("Nome de usuário do Discord de quem inseriu o filme")
                .setRequired(false)
        ),
    async execute(interaction) {
        const nomeFilme = interaction.options.getString("nome");
        const username = interaction.options.getString("usuario");

        if (!nomeFilme && !username) {
            await interaction.reply("É necessário informar ao menos um parâmetro para busca");
        }

        try {
            const filtros = [];
            const valores = [];

            if (nomeFilme) {
                valores.push(`%${nomeFilme}%`);
                filtros.push(`nome_filme ILIKE $${valores.length}`);
            }

            if (username) {
                valores.push(username);
                filtros.push(`discord_user_username ILIKE $${valores.lenght}`);
            }

            const buscarFilmesQuery = `
                SELECT 
                    nome_filme, discord_user_username 
                FROM 
                    filmes_sugeridos 
                WHERE 
                    ${filtros.join(" AND ")}
                ORDER BY 
                    data_sugestao ASC;
            `;
            const { rows } = await query(buscarFilmesQuery, valores);

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
            await interaction.reply("Occoreu um erro ao buscar os filmes");
        }
    }
};
