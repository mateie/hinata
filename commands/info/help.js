const { MessageEmbed } = require('discord.js');
const { connect } = require('mongoose');

const Servers = require(`${process.cwd()}/models/servers`);

connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

exports.run = async (client, message, args, perms) => {
    let help = new MessageEmbed();

    Servers.findOne({
        serverID: message.guild.id,
    }, err => {
        if (err) console.error(err);

        let roles = perms;
        let actual = roles.actual;
        let allowedRoles = actual.allowed_roles;

        let totalCommands = 0;

        if (!args[0] || !client.categories.includes(args[0])) {
            help.addField(`Usage: ${client.prefix}${this.help.name} ${this.help.args}`, '\u200b')
                .addField(`Available categories:`, client.categories.join(', '));

            return message.channel.send(help);
        }

        help.setTitle(`Help: ${args[0]}`);

        client.commands.forEach(value => {
            if (value.help.category == args[0] && allowedRoles.includes(value.help.permission)) {
                help.addField(`${client.prefix}${value.help.name} ${value.help.args.join(' ')}`, `${value.help.description}`);
                totalCommands++;
            }
        });

        if (totalCommands <= 0) {
            help.addField(`There isn't any available command for you`, '\u200b');
        }

        message.channel.send(help);
    });
};

exports.help = {
    enabled: true,
    name: 'help',
    aliases: ['?', 'hlep', 'hepl'],
    args: ['[category]'],
    permission: 'MEMBER',
    description: 'Shows all commands',
};