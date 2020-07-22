const Discord = require('discord.js');
const mongoose = require('mongoose');

const Warns = require('../../models/warns');

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

exports.run = async (client, message) => {
    let user = message.mentions.members.first();

    if(user) {
        let warnsEmbed = new Discord.MessageEmbed()
        .setTitle(`Warns: ${user.displayName}`)
        .setDescription(`List of ${user.displayName} warnings`);

        Warns.find({
            serverID: message.guild.id,
            userID: user.user.id,
        }, (err, res) => {

            if(err) console.error(err);

            if(!res) {
                return message.channel.send('Unknown error occured');
            }

            res.forEach(element => {
                warnsEmbed.addField(`Reason: ${element.reason}`, `Warned by: <@${element.warnedBy}>`)
                .setFooter(`${element.timestamp}`);
            });

            if(res.length < 1) {
                warnsEmbed.addField(`This user doesn't have any warnings`, `<@${user.id}>`);
            }

            message.channel.send(warnsEmbed);
        });
    }
};

exports.help = {
    enabled: true,
    name: 'warns',
    aliases: ['warnlist'],
    args: ['<@mention>'],
    permission: 'ADMIN',
    description: 'Displays user\'s warnings',
};