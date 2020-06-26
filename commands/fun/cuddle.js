const Discord = require('discord.js');
const superagent = require('superagent');

exports.run = async (client, message) => {
    if(!message.mentions.users.first()) return message.reply('You need to mention someone to cuddle them');
    if(message.mentions.users.first().id == client.user.id && message.author.id !== '401269337924829186')return message.channel.send('UwU *cuddles you*');
    if(message.mentions.users.first().id == client.user.id && message.author.id == '401269337924829186') return message.reply('OwO *dev cuddles you*');
    const { body } = await superagent
    .get('https://nekos.life/api/v2/img/cuddle');

    const embed = new Discord.MessageEmbed()
    .setColor('#ff9900')
    .setTitle(`${message.author.username} cuddled ${message.mentions.users.first().username} OwO`)
    .setImage(body.url);

    message.channel.send({ embed });
};

exports.help = {
    name: 'cuddle',
    aliases: [],
    args: ['<@mention>'],
    permission: 'USER',
    description: 'Cuddle someone UwU',
};