const { MessageEmbed } = require("discord.js");

exports.run = async (client, message) => {
    let random = Math.floor(Math.random() * 10);

    console.log(random);

    let pp = '8';

    for (let i = 0; i < random; i++) {
        pp += '=';
    }

    pp += 'D';

    let embed = new MessageEmbed()
        .setTitle('This is your PP size')
        .addField('\u200B', pp);

    return message.channel.send(embed);
};

exports.help = {
    enabled: true,
    name: 'pp',
    aliases: ['peepee'],
    args: [],
    permission: 'MEMBER',
    description: 'Determines your pp size',
};