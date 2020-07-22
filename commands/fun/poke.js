const { MessageEmbed } = require('discord.js');
const superagent = require('superagent');

exports.run = async (client, message) => {
    if(message.mentions.users.first().id === client.user.id) return message.channel.send('Aww! What?');

    const { body } = await superagent
    .get('https://nekos.life/api/v2/img/poke')
    .catch(e => {
        if(e) {
            message.channel.send('Something broke...');
            console.log(e);
        }
    });

    const embed = new MessageEmbed()
    .setColor('#ff9900')
    .setTitle(`${message.mentions.users.first().username}, you got poked by ${message.author.username}`)
    .setImage(body.url);

    message.channel.send({ embed });
};

exports.help = {
    enabled: true,
    name: 'poke',
    aliases: [],
    args: ['<@mention>'],
    permission: 'USER',
    description: 'Poke someone',
};