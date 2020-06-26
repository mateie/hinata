const Discord = require('discord.js');
const superagent = require('superagent');

exports.run = async (client, message) => {
    const { body } = await superagent
    .get('https://nekos.life/api/v2/img/smug');

    const embed = new Discord.MessageEmbed()
    .setColor('#ff9900')
    .setImage(body.url);

    message.channel.send({ embed });
};

exports.help = {
    name: 'smug',
    aliases: [],
    args: [],
    permission: 'USER',
    description: 'Smugs',
};