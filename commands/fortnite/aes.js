const { EmbedBuilder } = require('discord.js');
const axios = require('../../axiosConfig'); // Assuming your axios configuration is in axiosConfig.js
const { Translate } = require('../../process_tools');

module.exports = {
    name: 'aes',
    description: 'Fetch and display the latest Fortnite AES keys.',
    showHelp: true,
    async execute({ client, inter }) {
        try {
            // Fetch AES keys from the API
            const response = await axios.get('https://fortnitecentral.genxgames.gg/api/v1/aes');
            const aesData = response.data;

            // Extract main AES key and dynamic keys
            const mainKey = aesData.mainKey || 'Unknown';
            const dynamicKeys = aesData.dynamicKeys || [];

            // Embed Builder
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true }) })
                .setTitle(await Translate('Fortnite AES Keys'))
                .setDescription(
                    `Here are the latest AES keys for Fortnite:\n\n**Main Key:**\n\`\`\`${mainKey}\`\`\`\n**Dynamic Keys:**`
                )
                .addFields(
                    dynamicKeys.map((key) => ({
                        name: key.pakFilename || 'Unknown Pak',
                        value: `AES Key: \`${key.key}\``,
                        inline: false
                    }))
                )
                .setTimestamp()
                .setFooter({ text: 'CJSBot <❤️>', iconURL: inter.member.displayAvatarURL({ dynamic: true }) });

            // Send Embed
            inter.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching AES keys:', error);

            inter.editReply('An error occurred while fetching AES keys. Please try again later.');
        }
    }
};