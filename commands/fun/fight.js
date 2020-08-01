const fights = require(`${process.cwd()}/data/fights.json`);
const { MessageEmbed } = require('discord.js');

exports.run = (client, message) => {
    let user = message.mentions.users.first();
    if(!user) return message.reply('You can\'t fight thin air, pick someone to fight pussy');
    if(user.id === client.user.id) {
        let embed = new MessageEmbed().setImage('https://steamuserimages-a.akamaihd.net/ugc/795363460505308083/2B941A876478F26DFDA59CDBE3DF1EA229E8542F/');
        return message.channel.send({ embed });
    }
    message.channel.send(`**${message.author.username}** is fighting **${user.username}** ${fights[Math.floor(Math.random() * fights.length)]}`);
};

exports.help = {
    enabled: true,
    name: 'fight',
    aliases: [],
    args: ['<@mention>'],
    permission: 'MEMBER',
    description: 'Fight a user',
};