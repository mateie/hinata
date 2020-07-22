const { MessageEmbed } = require('discord.js');
const { connect } = require('mongoose');

const Servers = require(`${process.cwd()}/models/servers`);

connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

exports.run = async (client, message, args) => {
    Servers.findOne({
        serverID: message.guild.id,
    }, (err, settings) => {
        if(err) console.error(err);

        let channelDB = args[0];
        let channelGuild = args[1];

        if(typeof (channelDB) !== 'undefined') {
            channelDB = channelDB.toLowerCase();
        }

        if(!channelDB) {
            const embed = new MessageEmbed()
            .setTitle(`${message.guild.name}'s Channels`)
            .setDescription('Values are case-sensitive');
            for(let i = 1; i < Object.keys(settings.channels).length; i++) {
                let channelName = Object.keys(settings.channels)[i];
                let channelValue = Object.values(settings.channels)[i];
                if(channelValue === '' || channelValue.length < 1) {
                    channelValue = 'Not Set';
                }

                embed.addField(`${channelName}`, `${channelValue}`);
            }

            return message.channel.send({ embed });
        }

        if(typeof (settings.channels[channelDB]) !== 'undefined') {
            return message.channel.send(`\`\`\`${channelDB} doesn't exist\`\`\``);
        }

        if(!channelGuild) {
            return message.channel.send(`\`\`\`${channelDB} Channel Name is ${settings.channels[channelDB]}\`\`\``);
        }

        message.channel.send(`\`\`\`${channelDB} channel value was set to ${channelGuild}\`\`\``);
        settings.roles[channelDB] = channelGuild;

        settings.save();
    });
};

exports.help = {
    enabled: true,
    name: 'channels',
    aliases: [],
    args: ['[channel]', '[channel name]'],
    permission: 'OWNER',
    description: 'Change Channels Names for Permissions',
};