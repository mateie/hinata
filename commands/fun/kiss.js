const { MessageEmbed } = require('discord.js');
const superagent = require('superagent');

exports.run = async (client, message) => {
    if(message.mentions.users.first().id === client.user.id) return message.channel.send('Mwah :heart:');

    const { body } = await superagent
    .get('https://nekos.life/api/kiss');

    const embed = new MessageEmbed()
    .setColor('#ff9900')
    .setTitle(`${message.author.username} kissed ${message.mentions.users.first().username} :heart:`)
    .setImage(body.url);

    message.channel.send({ embed });
};

exports.help = {
    enabled: true,
    name: 'kiss',
    aliases: [],
    args: ['<@mention>'],
    permission: 'MEMBER',
    description: 'Kisses someone UwU',
};