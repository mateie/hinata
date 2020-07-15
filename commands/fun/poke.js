const Discord = require('discord.js');
const superagent = require('superagent');

exports.run = async (client, message) => {
    if(!message.mentions.users.first()) return message.reply('You need to mention a user to poke');
    if(message.mentions.users.first().id === client.user.id) return message.channel.send('Aww! Thank you');
    if(message.mentions.users.first().id == message.author.id) return message.reply('That\'s not possible');

    const { body } = await superagent
    .get('https://nekos.life/api/v2/img/poke')
    .catch(e => {
        if(e) {
            message.channel.send('Something broke...');
            console.log(e);
        }
    });

    const embed = new Discord.MessageEmbed()
    .setColor('#ff9900')
    .setTitle(`${message.mentions.users.first().username}, you got poked by ${message.author.username}`)
    .setImage(body.url);

    message.channel.send({ embed });
};

exports.help = {
    name: 'poke',
    aliases: [],
    args: ['<@mention>'],
    permission: 'USER',
    description: 'Poke someone',
};