const Discord = require('discord.js');

exports.run = (client, message) => {
    if(!client.lockit) client.lockit = [];

    let permissions = message.channel.permissionsFor(message.guild.id);

    if(permissions.has('SEND_MESSAGES')) {
        message.channel.createOverwrite(message.guild.id, {
            SEND_MESSAGES: false,
        });
        return message.channel.send(`**${message.author.username}** locked the channel down. Please be patient until it unlocks`);
    } else {
        message.channel.createOverwrite(message.guild.id, {
            SEND_MESSAGES: true,
        });
        return message.channel.send(`**${message.author.username}** lock has been lifted from the channel. Enjoy your chatting`);
    }
};

exports.getPermName = (bitfield) => {
    for (let key in Discord.Permissions.FLAGS) {
        if(Discord.Permissions.FLAGS[key] == bitfield) return key;
    }

    return null;
};

exports.help = {
    enabled: true,
    name: 'lockdown',
    aliases: ['ld', 'lock'],
    args: [],
    permission: 'ADMIN',
    description: 'This will lock a channel down.',
    usage: 'lockdown',
};