const { MessageEmbed } = require('discord.js');
const { connect } = require('mongoose');

const Warns = require('../../models/warns');

connect(process.env.DATABASE, {
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

        let warnEmbed = new MessageEmbed()
        .setTitle(`You have been warned on ${message.guild.name}`)
        .setThumbnail(message.guild.iconURL)
        .addField(`Warned by`, message.author.username)
        .addField(`Reason`, reason);

        let infoWarn = new MessageEmbed()
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

        await user.send(warnEmbed);
        message.channel.send(infoWarn);
    } else {
        message.channel.send('User not found');
    }
};

exports.help = {
    enabled: true,
    name: 'warn',
    aliases: [],
    args: ['<@mention>', '[reason]'],
    permission: 'ADMIN',
    description: 'warns a user with a reason',
};