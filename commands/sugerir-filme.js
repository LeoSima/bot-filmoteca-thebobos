import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
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
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const sugerirFilmeQuery = `
                INSERT INTO filmes_sugeridos (nome_filme, discord_user_id, discord_user_username) 
                VALUES ($1, $2, $3) RETURNING filme_sugerido_id, nome_filme;
            `;
            const parametrosQuery = [nomeFilme, userId, username];

            const resultado = await query(sugerirFilmeQuery, parametrosQuery);

            const sugestaoGravada = resultado.rows[0];
            const embed = new EmbedBuilder()
                .setTitle("Tá salvo pivete, gratiluz 😉🙏🏾")
                .setDescription(`Sugestão do filme ${sugestaoGravada.nome_filme} gravada com sucesso! ID da sugestão: ${sugestaoGravada.filme_sugerido_id}`)
                .setColor("Random");

            await interaction.editReply("Sugestão de filme salva com sucesso");
            await interaction.followUp({ embeds: [embed] });
            await interaction.deleteReply();
        } catch (error) {
            console.error("Erro ao gravar sugestão no banco de dados: ", error);
            await interaction.editReply("Ocorreu um erro ao tentar gravar a sugestão de filme");
        }
    }
};
