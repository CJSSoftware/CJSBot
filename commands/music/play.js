const { QueryType, useMainPlayer } = require('discord-player');
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { Translate } = require('../../process_tools');

module.exports = {
    name: 'play',
    description: "Play a song!",
    voiceChannel: true,
    options: [
        {
            name: 'song',
            description: 'The song you want to play',
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],

    async execute({ inter, client }) {
        const player = useMainPlayer();

        const song = inter.options.getString('song');
        const res = await player.search(song, {
            requestedBy: inter.member,
            searchEngine: QueryType.AUTO
        });

        let defaultEmbed = new EmbedBuilder().setColor('#2f3136');

        if (!res?.tracks.length) {
            defaultEmbed.setAuthor({ name: await Translate(`No results found... try again ? <❌>`) });
            return inter.editReply({ embeds: [defaultEmbed] });
        }

        try {
            const { track } = await player.play(inter.member.voice.channel, song, {
                nodeOptions: {
                    metadata: {
                        channel: inter.channel
                    },
                    volume: client.config.opt.volume,
                    leaveOnEmpty: client.config.opt.leaveOnEmpty,
                    leaveOnEmptyCooldown: client.config.opt.leaveOnEmptyCooldown,
                    leaveOnEnd: client.config.opt.leaveOnEnd,
                    leaveOnEndCooldown: client.config.opt.leaveOnEndCooldown,
                }
            });

            defaultEmbed.setAuthor({ name: await Translate(`Loading <${track.title}> to the queue... <✅>`) });
            await inter.editReply({ embeds: [defaultEmbed] });

            // Handle the `trackEnd` event
            player.on('trackEnd', async (queue, track) => {
                if (queue && queue.tracks.length === 1) { // Check if only 1 song remains in the queue
                    const nextSong = queue.tracks[0];
                    if (nextSong) {
                        console.log(`Auto-playing last queued song: ${nextSong.title}`);
                        player.play(inter.member.voice.channel, nextSong, {
                            nodeOptions: {
                                metadata: {
                                    channel: inter.channel,
                                },
                            }
                        });
                    }
                }
            });

        } catch (error) {
            console.log(`Play error: ${error}`);
            defaultEmbed.setAuthor({ name: await Translate(`I can't join the voice channel... try again ? <❌>`) });
            return inter.editReply({ embeds: [defaultEmbed] });
        }
    }
};