const { MessageEmbed } = require('discord.js');
const superagent = require('superagent');

exports.run = async (client, message) => {
    const { body } = await superagent
    .get('https://nekos.life/api/neko');

    let link = body.neko;

    const embed = new MessageEmbed()
    .setColor('#ff9900')
    .setTitle('Here\'s your Neko')
    .setImage(link);

    message.channel.send({ embed });
};

exports.help = {
    enabled: true,
    name: 'neko',
    aliases: [],
    args: [],
    permission: 'MEMBER',
    description: 'Sends a random Neko',
};