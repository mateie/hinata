const { MessageEmbed } = require('discord.js');
const superagent = require('superagent');

exports.run = async (client, message) => {
    const { body } = await superagent
    .get('https://nekos.life/api/v2/img/ngif');

    const embed = new MessageEmbed()
    .setColor('#ff9900')
    .setTitle('Neko Gif UwU')
    .setImage(body.url);

    message.channel.send({ embed });
};

exports.help = {
    enabled: true,
    name: 'ngif',
    aliases: ['nekogif'],
    args: [],
    permission: 'USER',
    description: 'Neko GIFs',
};