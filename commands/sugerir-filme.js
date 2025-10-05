import { SlashCommandBuilder } from "discord.js";
import { query } from "../data/db.js";

export default {
    data: new SlashCommandBuilder()
        .setName("sugerir")
        .setDescription("Registra uma sugestão de filme")
        .addStringOption(nomeFilme =>
            nomeFilme.setName("filme")
                .setDescription("Nome do filme que você quer sugerir (mantenha o mais próximo do nome original)")
                .setRequired(true)
        ),
    async execute(interaction) {
        const nomeFilme = interaction.options.getString("filme");
        const userId = interaction.user.id;
        const username = interaction.user.username;

        try {
            const sugerirFilmeQuery = `
                INSERT INTO filmes_sugeridos (nome_filme, discord_user_id, discord_user_username) 
                VALUES ($1, $2, $3) RETURNING filme_sugerido_id;
            `;
            const parametrosQuery = [nomeFilme, userId, username];

            const resultado = await query(sugerirFilmeQuery, parametrosQuery);
            await interaction.reply(`Sugestão gravada com sucesso! ID da sugestão: ${resultado.rows[0].filme_sugerido_id}`);
        } catch (error) {
            console.error("Erro ao gravar sugestão no banco de dados: ", error);
            await interaction.reply("Ocorreu um erro ao tentar gravar a sugestão de filme");
        }
    }
};
