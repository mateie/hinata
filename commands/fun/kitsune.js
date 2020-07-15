const Discord = require('discord.js');
const superagent = require('superagent');

exports.run = async (client, message) => {
    const { body } = await superagent
    .get('https://nekos.life/api/v2/img/fox_girl');

    const embed = new Discord.MessageEmbed()
    .setColor('#ff9900')
    .setTitle(`OwO, Here's your Kitsune`)
    .setImage(body.url);

    message.channel.send({ embed });
};

exports.help = {
    enabled: true,
    name: 'kitsune',
    aliases: ['foxgirls'],
    args: [],
    permission: 'USER',
    description: 'Kitsunes (Fox Girls)',
};