const { EmbedBuilder } = require('discord.js');
const { Translate } = require('../../process_tools');

module.exports = {
    name: 'help',
    description: "All the commands this bot has!",
    showHelp: false,

    async execute({ client, inter }) {
        const commands = client.commands.filter(x => x.showHelp !== false);

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }) })
            .setDescription(await Translate('Here are all the commands available for use:'))
            .addFields([
                {
                    name: "🔗 **General Commands**",
                    value: "`ping` | `help` | `fortnite`"
                },
                {
                    name: "🎶 **Music Commands**",
                    value: "`play` | `pause` | `resume` | `queue` | `playnext` | `back` | `shuffle`"
                },
                {
                    name: "🔊 **Music Playback Options**",
                    value: "`controller` | `seek` | `lyrics` | `loop` | `nowplaying` | `stop` | `skip` | `skipto` | `volume`"
                },
                {
                    name: "📜 **Search Options**",
                    value: "`filter` | `history` | `save` | `search` | `syncedlyrics`"
                },
                {
                    name: "🚓 **Moderation Commands**",
                    value:"`clear` | `more coming soon`"
                }
            ])
            .setTimestamp()
            .setFooter({ text: await Translate('CJSBot <❤️>'), iconURL: inter.member.avatarURL({ dynamic: true }) });

        inter.editReply({ embeds: [embed] });
    }
};