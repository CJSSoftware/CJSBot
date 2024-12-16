const { EmbedBuilder } = require('discord.js');
const axios = require('axios'); // Import the custom axios instance
const { Translate } = require('../../process_tools');

module.exports = {
    name: 'fortnite',
    description: 'Fortnite commands with subcommands like map, itemshop, news, etc.',
    showHelp: true,
    options: [
        {
            name: 'subcommand',
            type: 3, // STRING type for the subcommand
            description: 'The Fortnite subcommand to execute (map, itemshop, news, etc.)',
            required: true,
            choices: [
                { name: 'Map', value: 'map' },
                { name: 'News', value: 'news' },
                { name: 'Banners', value: 'banners' },
                { name: 'Item Shop', value: 'itemshop' },
                { name: 'Cosmetics', value: 'cosmetics' },
                { name: 'Maps', value: 'playlists' }
            ]
        },
        {
            name: 'query',
            type: 3, // STRING type for additional input
            description: 'Optional query for commands like stats or cosmetic',
            required: false
        }
    ],

    async execute({ client, inter }) {
        const subcommand = inter.options.getString('subcommand');
        const query = inter.options.getString('query');

        try {
            let embed;

            switch (subcommand) {
                case 'map':
                    embed = await getMapEmbed(client, inter);
                    break;
                case 'news':
                    embed = await getNewsEmbed(client, inter);
                    break;
                case 'banners':
                    embed = await getBannersEmbed(client, inter);
                    break;
                case 'itemshop':
                    embed = await getItemShopEmbed(client, inter);
                    break;
                case 'cosmetics':
                    embed = await getCosmeticsEmbed(client, inter);
                    break;
                case 'playlists':
                    embed = await getPlaylistsEmbed(client, inter);
                    break;
            /*
                case '':
                    embed = await get Embed(client, inter);
                    break;
            */
                default:
                    return inter.editReply('Invalid subcommand. Please choose from map, itemshop, news, stats, or creative.');
            }

            inter.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            inter.editReply('An error occurred while executing the command. Please try again later.');
        }
    }
};

// Get Map Embed
async function getMapEmbed(client, inter) {
    const response = await axios.get('https://fortnite-api.com/v1/map');
    const mapImage = response.data.data.images.pois;

    return new EmbedBuilder()
        .setColor('#ff0000')
        .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }) })
        .setDescription(await Translate('This is the current Fortnite Map:'))
        .setImage(mapImage)
        .setTimestamp()
        .setFooter({ text: await Translate('CJSBot <❤️>'), iconURL: inter.member.displayAvatarURL({ dynamic: true }) });
}

// Get Banners Embed
async function getBannersEmbed(client, inter) {
    try {
        // Fetch banners from the Fortnite API
        const response = await axios.get('https://fortnite-api.com/v2/cosmetics/br/banners');
        const banners = response?.data?.data || []; // Ensure safe navigation with optional chaining

        // Handle case where no banners are found
        if (!banners || banners.length === 0) {
            return new EmbedBuilder()
                .setColor('#0000ff')
                .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }) })
                .setTitle(await Translate('Banners'))
                .setDescription('No banners are currently available.')
                .setTimestamp()
                .setFooter({ text: await Translate('CJSBot <❤️>'), iconURL: inter.member.displayAvatarURL({ dynamic: true }) });
        }

        // Map the first 10 banners to embed fields
        const fields = banners.slice(0, 10).map(banner => ({
            name: banner.name || 'Unknown Banner',
            value: `Rarity: ${banner.rarity || 'Unknown'}`,
            inline: true
        }));

        // Return the banners embed
        return new EmbedBuilder()
            .setColor('#0000ff')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }) })
            .setTitle(await Translate('Banners'))
            .addFields(fields)
            .setTimestamp()
            .setFooter({ text: await Translate('CJSBot <❤️>'), iconURL: inter.member.displayAvatarURL({ dynamic: true }) });
    } catch (error) {
        console.error('Error fetching banners:', error);

        // Handle unexpected errors with fallback embed
        return new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }) })
            .setTitle(await Translate('Banners'))
            .setDescription('An error occurred while fetching banner data.')
            .setTimestamp()
            .setFooter({ text: await Translate('CJSBot <❤️>'), iconURL: inter.member.displayAvatarURL({ dynamic: true }) });
    }
}

// Get Item Shop Embed
async function getItemShopEmbed(client, inter) {
    try {
        const response = await axios.get('https://fortnite-api.com/v2/shop');
        const items = response.data.data?.featured || [];

        if (!items.length) {
            return new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }) })
                .setTitle(await Translate('Item Shop'))
                .setDescription('No items currently in the shop.')
                .setTimestamp()
                .setFooter({ text: await Translate('CJSBot <❤️>'), iconURL: inter.member.displayAvatarURL({ dynamic: true }) });
        }

        const fields = items.slice(0, 10).map(item => ({
            name: item.name || 'Unknown Item',
            value: `Rarity: ${item.rarity || 'Unknown'}\nPrice: ${item.price || 'Unknown'}`,
            inline: true
        }));

        return new EmbedBuilder()
            .setColor('#ffff00')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }) })
            .setTitle(await Translate('Item Shop'))
            .addFields(fields)
            .setTimestamp()
            .setFooter({ text: await Translate('CJSBot <❤️>'), iconURL: inter.member.displayAvatarURL({ dynamic: true }) });
    } catch (error) {
        console.error('Error fetching item shop:', error);

        return new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }) })
            .setTitle(await Translate('Item Shop'))
            .setDescription('An error occurred while fetching the item shop.')
            .setTimestamp()
            .setFooter({ text: await Translate('CJSBot <❤️>'), iconURL: inter.member.displayAvatarURL({ dynamic: true }) });
    }
}

// Get Cosmetics Embed
async function getCosmeticsEmbed(client, inter) {
    try {
        const response = await axios.get('https://fortnite-api.com/v2/cosmetics/br');
        const cosmetics = response.data.data.items;

        const fields = cosmetics.slice(0, 10).map(cosmetic => ({
            name: cosmetic.name || 'Unknown Item',
            value: `Type: ${cosmetic.type || 'Unknown'}\nRarity: ${cosmetic.rarity || 'Unknown'}`,
            inline: true
        }));

        return new EmbedBuilder()
            .setColor('#00ff00')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }) })
            .setTitle(await Translate('Cosmetics'))
            .addFields(fields)
            .setTimestamp()
            .setFooter({ text: await Translate('CJSBot <❤️>'), iconURL: inter.member.displayAvatarURL({ dynamic: true }) });
    } catch (error) {
        console.error('Error fetching cosmetics:', error);

        return new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }) })
            .setTitle(await Translate('Cosmetics'))
            .setDescription('An error occurred while fetching cosmetics.')
            .setTimestamp()
            .setFooter({ text: await Translate('CJSBot <❤️>'), iconURL: inter.member.displayAvatarURL({ dynamic: true }) });
    }
}

// Get Playlists Embed
async function getPlaylistsEmbed(client, inter) {
    try {
        const response = await axios.get('https://fortnite-api.com/v2/playlists');
        const playlists = response.data.data;

        const fields = playlists.slice(0, 10).map(playlist => ({
            name: playlist.name || 'Unknown Playlist',
            value: `Playlist Type: ${playlist.mode || 'Unknown'}`,
            inline: true
        }));

        return new EmbedBuilder()
            .setColor('#ff9900')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }) })
            .setTitle(await Translate('Playlists'))
            .addFields(fields)
            .setTimestamp()
            .setFooter({ text: await Translate('CJSBot <❤️>'), iconURL: inter.member.displayAvatarURL({ dynamic: true }) });
    } catch (error) {
        console.error('Error fetching playlists:', error);

        return new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }) })
            .setTitle(await Translate('Playlists'))
            .setDescription('An error occurred while fetching playlists.')
            .setTimestamp()
            .setFooter({ text: await Translate('CJSBot <❤️>'), iconURL: inter.member.displayAvatarURL({ dynamic: true }) });
    }
}
// Get Latest News Embed
// Get Latest News Embed
async function getNewsEmbed(client, inter) {
    try {
        // Fetch news data from the correct API endpoint
        const response = await axios.get('https://fortnite-api.com/v2/news');
        const newsEntries = response?.data?.data?.br?.motds || []; // Extract news entries

        // If no news entries are available, send a fallback message
        if (!newsEntries || newsEntries.length === 0) {
            return new EmbedBuilder()
                .setColor('#0000ff')
                .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }) })
                .setTitle(await Translate('Latest Fortnite News'))
                .setDescription('No news is currently available.')
                .setTimestamp()
                .setFooter({ text: await Translate('CJSBot <❤️>'), iconURL: inter.member.displayAvatarURL({ dynamic: true }) });
        }

        // Map the latest 5 news entries to embed fields
        const fields = newsEntries.slice(0, 5).map(entry => ({
            name: entry.title || 'Unknown Title',
            value: entry.body || 'No description available.',
            inline: false,
        }));

        // Return the news embed with fields
        return new EmbedBuilder()
            .setColor('#0000ff')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }) })
            .setTitle(await Translate('Latest Fortnite News'))
            .addFields(fields)
            .setTimestamp()
            .setFooter({ text: await Translate('CJSBot <❤️>'), iconURL: inter.member.displayAvatarURL({ dynamic: true }) });
    } catch (error) {
        console.error('Error fetching news:', error);

        // Return fallback embed if an error occurs
        return new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }) })
            .setTitle(await Translate('Latest Fortnite News'))
            .setDescription('An error occurred while fetching the latest news.')
            .setTimestamp()
            .setFooter({ text: await Translate('CJSBot <❤️>'), iconURL: inter.member.displayAvatarURL({ dynamic: true }) });
    }
}