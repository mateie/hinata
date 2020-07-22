const { MessageEmbed } = require('discord.js');
const superagent = require('superagent');

exports.run = async (client, message) => {
    if(message.mentions.users.first().id === client.user.id) return message.reply('I need more RAM ples :(');

    const { body } = await superagent
    .get('https://nekos.life/api/v2/img/feed');

    const embed = new MessageEmbed()
    .setColor('#ff9900')
    .setTitle(`${message.mentions.users.first().username}, you got fed by ${message.author.username} OwO`)
    .setImage(body.url);

    message.channel.send({ embed });
};

exports.help = {
    enabled: true,
    name: 'feed',
    aliases: [],
    args: ['<@mention>'],
    permission: 'USER',
    description: 'Feed someone UwU',
};