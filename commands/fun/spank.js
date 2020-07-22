const { MessageEmbed } = require('discord.js');
const superagent = require('superagent');

exports.run = async (client, message) => {
    if(!message.channel.nsfw) return message.reply('This channel is not NSFW');
    if(message.mentions.users.first().id === '401269337924829186') return message.reply('You can\'t spank my dev');

    const { body } = await superagent
    .get('https://nekos.life/api/v2/img/spank');

    const embed = new MessageEmbed()
    .setColor('#ff9900')
    .setTitle(`${message.mentions.users.first().username}, you got spanked in ur thicc ass by ${message.author.username} :clap:`)
    .setImage(body.url);

    message.channel.send({ embed });
};

exports.help = {
    enabled: true,
    name: 'spank',
    aliases: [],
    args: ['<@mention>'],
    permission: 'USER',
    description: 'Spank someone',
};