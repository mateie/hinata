const Discord = require('discord.js');
const superagent = require('superagent');

exports.run = async (client, message) => {
    const { body } = await superagent
    .get('http://aws.random.cat/meow');

    const embed = new Discord.MessageEmbed()
    .setColor('#ff9900')
    .setTitle('Here\'s Your Cat')
    .setImage(body.file);

    message.channel.send({ embed });
};

exports.help = {
    enabled: true,
    name: 'cat',
    aliases: [],
    args: [],
    permission: 'USER',
    description: 'Sends a random cat',
};