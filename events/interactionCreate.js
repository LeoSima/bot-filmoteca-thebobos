import { Events, MessageFlags } from "discord.js";

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const comando = interaction.client.commands.get(interaction.commandName);

        if (!comando) {
            console.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado`);
            return;
        }

        try {
            await comando.execute(interaction);
        } catch (error) {
            console.error(error);

            const replyOptions = { content: "Erro ao executar o comando", flags: MessageFlags.Ephemeral };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(replyOptions);
            } else {
                await interaction.reply(replyOptions);
            }
        }
	},
};
