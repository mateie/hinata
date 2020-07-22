const { MessageEmbed } = require('discord.js');
const superagent = require('superagent');

exports.run = async (client, message) => {
    if(message.mentions.users.first().id === client.user.id) return message.channel.send('Aww!');
    if(message.mentions.users.first().id === message.author.id) return message.channel.send('Patted you :heart:');

    const { body } = await superagent
    .get('https://nekos.life/api/pat');

    const embed = new MessageEmbed()
    .setColor('#ff9900')
    .setTitle(`OwO ${message.mentions.users.first().username}, you got a head pat from ${message.author.username}`)
    .setImage(body.url);

    message.channel.send({ embed });
};

exports.help = {
    enabled: true,
    name: 'pat',
    aliases: [],
    args: ['<@mention>'],
    permission: 'USER',
    description: 'Pats someone OwO',
};