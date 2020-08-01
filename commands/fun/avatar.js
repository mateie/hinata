const { MessageEmbed } = require('discord.js');

exports.run = (client, message) => {
    let avatar = message.mentions.users.size ? message.mentions.users.first().avatarURL({ format: 'png', dynamic: true, size: 2048 }) : message.author.avatarURL({ format: 'png', dynamic: true, ize: 2048 });

    const embed = new MessageEmbed()
    .setColor('RANDOM');
    if(message.mentions.users.size > 0) {
        embed.setTitle(`Avatar for ${message.mentions.users.first().username}:`);
    } else {
        embed.setTitle(`Avatar for ${message.author.username}:`);
    }
    embed.setImage(`${avatar + "?size=2048"}`);

    message.channel.send({ embed });
};

exports.help = {
    enabled: true,
    name: 'avatar',
    aliases: [],
    args: ['[@mention]'],
    permission: 'MEMBER',
    description: 'Gets a user\'s avatar',
};