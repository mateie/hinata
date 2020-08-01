const { MessageEmbed } = require('discord.js');
const superagent = require('superagent');

exports.run = async (client, message) => {
    const { body } = await superagent
    .get('https://nekos.life/api/v2/img/cuddle');

    const embed = new MessageEmbed()
    .setColor('#ff9900')
    .setTitle(`${message.author.username} cuddled ${message.mentions.users.first().username} OwO`)
    .setImage(body.url);

    message.channel.send({ embed });
};

exports.help = {
    enabled: true,
    name: 'cuddle',
    aliases: [],
    args: ['<@mention>'],
    permission: 'MEMBER',
    description: 'Cuddle someone UwU',
};