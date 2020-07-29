const Servers = require('../../models/servers');

exports.run = async (client, message, args) => {
    Servers.findOne({
        serverID: message.guild.id,
    }, async (err, res) => {
        if (err) console.error(err);

        let emojiName = args.slice(1, args.length).join(' ');

        let emoji = message.guild.emojis.cache.find(e => e.name === emojiName);
        if (!emoji) {
            return message.channel.send(`\`\`\`${emojiName} can't be found\`\`\``);
        }

        let channel = message.guild.channels.cache.find(ch => ch.name === res.channels.reactions);
        let msg = channel.messages.cache.get(res.messageID);

        if (args[0] === 'add') {
            await msg.react(emoji);
        } else if (args[0] === 'remove') {
            await msg.reactions.removeAll();
        }
    });
};

exports.help = {
    enabled: true,
    name: 'reactionroles',
    aliases: ['rr'],
    args: ['<add/remove>', '<emoji name>'],
    permission: 'OWNER',
    description: 'Reaction Roles',
};