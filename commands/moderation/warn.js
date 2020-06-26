const Discord = require('discord.js');
const mongoose = require('mongoose');

const Warns = require('../../models/warns');

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

exports.run = async (client, message, args) => {
    let user = message.mentions.members.first();
    let reason = args.slice(1).join(' ');

    if(user) {
        if(user.id == message.author.id || user.user.bot) {
            return message.channel.send('The person can\'t be warned');
        }

        let warnEmbed = new Discord.MessageEmbed()
        .setTitle(`You have been warned on ${message.guild.name}`)
        .setThumbnail(message.guild.iconURL)
        .addField(`Warned by`, message.author.username)
        .addField(`Reason`, reason);

        let infoWarn = new Discord.MessageEmbed()
        .setTitle(`${user.displayName} has been warned`)
        .setThumbnail(message.guild.iconURL)
        .addField(`Warned by`, message.author.username)
        .addField(`Reason`, reason);

        let date = new Date();
        let dateString = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

        const newWarn = new Warns({
            serverID: message.guild.id,
            userName: user.displayName,
            userID: user.id,
            warnedBy: message.author.id,
            reason: reason,
            timestamp: dateString,
        });

        newWarn.save().catch(err => console.error(err));

        message.delete();

        await user.send(warnEmbed);
        message.channel.send(infoWarn);
    } else {
        message.channel.send('User not found');
    }
};

exports.help = {
    name: 'warn',
    aliases: [],
    args: ['@mention', '[reason]'],
    permission: 'ADMIN',
    description: 'warns a user with a reason',
};