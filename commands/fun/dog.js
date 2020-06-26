const Discord = require('discord.js');
const superagent = require('superagent');

exports.run = async (client, message) => {
    const { body } = await superagent
    .get('http://random.dog/woof.json');

    let link = body.url;

    const embed = new Discord.MessageEmbed()
    .setColor('#ff9900')
    .setTitle('Here\'s yo dog')
    .setImage(link);

    message.channel.send({ embed });
};

exports.help = {
    name: 'dog',
    aliases: [],
    args: [],
    permission: 'USER',
    description: 'Sends a random doggy',
};