const { MessageEmbed } = require('discord.js');
const superagent = require('superagent');

exports.run = async (client, message) => {
    if(message.mentions.users.first().id === client.user.id) {
        const { body } = await superagent
        .get('https://nekos.life/api/v2/img/slap');

        const embed = new MessageEmbed()
        .setColor('#ff9900')
        .setTitle(`Uno Reverse card *slaps* ${message.author.username}`)
        .setImage(body.url);

        return message.channel.send({ embed });
    } else if(message.mentions.users.first().id == client.user.id && message.author.id !== '401269337924829186') {
        return message.channel.send('Ouch *owww*');
    }

    const { body } = await superagent
    .get('https://nekos.life/api/v2/img/slap');

    const embed = new MessageEmbed()
    .setColor('#ff9900')
    .setTitle(`OwO ${message.mentions.users.first().username} You got slapped by ${message.author.username}`)
    .setImage(body.url);

    message.channel.send({ embed });
};

exports.help = {
    enabled: true,
    name: 'slap',
    aliases: [],
    args: ['<@mention>'],
    permission: 'USER',
    description: 'Slap someone',
};