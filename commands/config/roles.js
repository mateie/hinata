const Discord = require('discord.js');
const mongoose = require('mongoose');

const Servers = require('../../models/servers');

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

exports.run = async (client, message, args) => {
    Servers.findOne({
        serverID: message.guild.id,
    }, (err, settings) => {
        if(err) console.error(err);

        let roleDB = args[0];
        let roleGuild = args[1];

        if(typeof (roleDB) !== 'undefined') {
            roleDB = roleDB.toLowerCase();
        }

        if(!roleDB) {
            const embed = new Discord.MessageEmbed()
            .setTitle(`${message.guild.name}'s Roles`);
            for(let i = 1; i < Object.keys(settings.roles).length; i++) {
                let roleName = Object.keys(settings.roles)[i];
                let roleValue = Object.values(settings.roles)[i];

                embed.addField(roleName, roleValue, true);
            }

            return message.channel.send({ embed });
        }

        if(typeof (settings.roles[roleDB]) === 'undefined') {
            return message.channel.send(`\`\`\`${roleDB} doesn't exist\`\`\``);
        }

        if(!roleGuild) {
            return message.channel.send(`\`\`\`${roleDB} Role Name is ${settings.roles[roleDB]}\`\`\``);
        }

        message.channel.send(`${roleDB} role value was set to ${roleGuild}`);
        settings.roles[roleDB] = roleGuild;
        
        settings.save();
    });
};

exports.help = {
    enabled: true,
    name: 'roles',
    aliases: [],
    args: ['[role]', '[role name]'],
    permission: 'OWNER',
    description: 'Change Role Names for Permissions',
};