const { ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { Translate } = require('../../process_tools');
require('dotenv').config();

// Helper to parse time strings (e.g., "2 days", "3 months") into milliseconds
function parseDuration(duration) {
  const timeRegex = /^(\d+)\s*(seconds?|minutes?|hours?|days?|months?|years?)$/i;
  const match = duration.match(timeRegex);

  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 'second':
      case 'seconds':
        return value * 1000;
    case 'minute':
      case 'minutes':
        return value * 60 * 1000;
    case 'hour':
      case 'hours':
        return value * 60 * 60 * 1000;
    case 'day':
      case 'days':
        return value * 24 * 60 * 60 * 1000;
    case 'month':
      case 'months':
        return value * 30 * 24 * 60 * 60 * 1000; // Approximation
    case 'year':
      case 'years':
        return value * 365 * 24 * 60 * 60 * 1000; // Approximation
    default:
      return null;
  }
}

module.exports = {
  name: 'moderation',
  description: 'Moderation commands such as mute, ban, kick, clearchat, timeout, etc.',
  showHelp: true,
  options: [
    {
      name: 'action',
      type: 3,
      description: 'Action to perform',
      required: true,
      choices: [
        { name: 'Mute', value: 'mute' },
        { name: 'Ban', value: 'ban' },
        { name: 'Kick', value: 'kick' },
        { name: 'Clearchat', value: 'clearchat' },
        { name: 'Timeout', value: 'timeout' },
      ],
    },
    {
      name: 'target',
      type: 6,
      description: 'The user to target',
      required: false,
    },
    {
      name: 'duration',
      type: 3,
      description: 'Duration (e.g. 30 seconds, 1 minute, 2 hours, 3 days, 4 months, or 1 year)',
      required: false,
    },
  ],

  async execute({ client, inter }) {
    const action = inter.options.getString('action');
    const target = inter.options.getUser('target');
    const duration = inter.options.getString('duration');

    if (!inter.member.roles.cache.some((role) => role.name === process.env.MODROLE)) {
      return inter.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Permission Denied')
            .setDescription('You do not have permission to execute this command.'),
        ],
      });
    }

    try {
      switch (action) {
        case 'mute':
          await handleMute(inter, target);
          break;

        case 'ban':
          await handleBan(inter, target);
          break;

        case 'kick':
          await handleKick(inter, target);
          break;

        case 'clearchat':
          await handleClearChat(inter);
          break;

        case 'timeout':
          if (duration) await handleTimeout(inter, target, duration);
          break;

        default:
          inter.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Unknown Command')
                .setDescription('Invalid action specified.'),
            ],
          });
      }
    } catch (error) {
      console.error(error);
      inter.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('An unexpected error occurred.'),
        ],
      });
    }
  },
};

// Handle Mute
async function handleMute(inter, target) {
  if (!target) {
    return inter.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('Error')
          .setDescription('You must specify a user to mute.'),
      ],
    });
  }

  const member = await inter.guild.members.fetch(target.id);
  if (member) {
    await member.timeout(60000, 'Muted for 1 minute');
    inter.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('Mute Success')
          .setDescription(`User ${target.username} has been muted.`),
      ],
    });
  }
}

// Handle Ban
async function handleBan(inter, target) {
  if (!target) {
    return inter.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('Error')
          .setDescription('You must specify a user to ban.'),
      ],
    });
  }

  const member = await inter.guild.members.fetch(target.id);

  if (member) {
    await member.ban();
    inter.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('Ban Success')
          .setDescription(`User ${target.username} has been banned.`),
      ],
    });
  }
}

// Handle Kick
async function handleKick(inter, target) {
  if (!target) {
    return inter.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('Error')
          .setDescription('You must specify a user to kick.'),
      ],
    });
  }

  const member = await inter.guild.members.fetch(target.id);

  if (member) {
    await member.kick();
    inter.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('Kick Success')
          .setDescription(`User ${target.username} has been kicked.`),
      ],
    });
  }
}

// Handle ClearChat
async function handleClearChat(inter) {
  const channels = inter.guild.channels.cache.filter(
    (channel) => channel.isTextBased()
  );
  for (const channel of channels.values()) {
    const messages = await channel.messages.fetch({ limit: 100 });
    await channel.bulkDelete(messages);
  }

  inter.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Cleared Chat')
        .setDescription('The chat has been cleared successfully.'),
    ],
  });
}

// Handle Timeout
async function handleTimeout(inter, target, duration) {
  const parsedDuration = parseDuration(duration);

  if (!parsedDuration) {
    return inter.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('Invalid Duration')
          .setDescription('Please specify a valid duration like 1 hour, 2 days, or 1 year.'),
      ],
    });
  }

  const member = await inter.guild.members.fetch(target.id);
  if (member) {
    await member.timeout(parsedDuration, duration);
    inter.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('Timeout Success')
          .setDescription(`User ${target.username} has been timed out for ${duration}.`),
      ],
    });
  }
}