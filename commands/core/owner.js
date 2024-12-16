const { EmbedBuilder } = require('discord.js');
const { Translate } = require('../../process_tools');
require('dotenv').config();

// Replace with the bot owner's Discord ID
const BOT_OWNER_ID = process.env.BOT_OWNER; // Replace this with the actual bot owner's Discord ID

module.exports = {
    name: 'info',
    description: "Information about the bot owner and bot commands.",
    showHelp: false,

    async execute({ client, inter }) {
        let botOwner;

        try {
            // Fetch bot owner's Discord user object
            botOwner = await client.users.fetch(BOT_OWNER_ID);
        } catch (error) {
            console.error("Error fetching bot owner:", error);
            botOwner = { username: "Unknown", id: BOT_OWNER_ID };
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true })
            })
            .setDescription(await Translate('Here is information about the bot owner and bot usage:'))
            .addFields([
                {
                    name: "🤖 **Bot Owner Information**",
                    value: `**Name:** ${botOwner.username || 'Unknown'}\n**ID:** ${botOwner.id}`,
                },
                {
                    name: "📜 **Bot Commands**",
                    value: "`ping`, `help`, `fortnite`, `play`, `pause`, `resume`, `queue`, `skip`, and others.",
                },
                {
                    name: "❤️ **Owner Contact**",
                    value: `[Contact Owner](https://discordapp.com/users/${BOT_OWNER_ID})`
                }
            ])
            .setTimestamp()
            .setFooter({ text: await Translate('CJSBot <❤️>'), iconURL: inter.member.avatarURL({ dynamic: true }) });

        inter.editReply({ embeds: [embed] });
    }
};